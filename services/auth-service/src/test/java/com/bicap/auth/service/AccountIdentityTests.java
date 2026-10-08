package com.bicap.auth.service;

import com.bicap.auth.config.JwtUtils;
import com.bicap.auth.controller.AuthController;
import com.bicap.auth.controller.GlobalExceptionHandler;
import com.bicap.auth.dto.AuthRequest;
import com.bicap.auth.factory.UserRegistrationFactory;
import com.bicap.auth.model.*;
import com.bicap.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccountIdentityTests {
    private final UserRepository repository = mock(UserRepository.class);
    private final UserRegistrationFactory factory = mock(UserRegistrationFactory.class);
    private final AuthenticationManager manager = mock(AuthenticationManager.class);
    private final JwtUtils jwt = mock(JwtUtils.class);
    private AuthenticationUser service() {
        var service = new AuthenticationUser();
        ReflectionTestUtils.setField(service, "userRepository", repository);
        ReflectionTestUtils.setField(service, "userRegistrationFactory", factory);
        ReflectionTestUtils.setField(service, "authManager", manager);
        ReflectionTestUtils.setField(service, "jwtUtils", jwt);
        return service;
    }
    private AuthRequest request(String email) {
        var request = new AuthRequest(); request.setEmail(email); request.setPassword("fixture-password");
        request.setRole("RETAILER"); request.setClientId("retailer"); return request;
    }
    private User user(long id) {
        var user = new User(); user.setId(id); user.setUsername("retailer"); user.setEmail("retailer@example.test");
        user.setPassword("private-hash"); user.setStatus(UserStatus.ACTIVE);
        var role = new Role(); role.setName(ERole.ROLE_RETAILER); user.setRole(Set.of(role)); return user;
    }
    @Test void duplicateEmailWithoutSubmittedUsernameIsRejectedBeforeSaving() {
        when(repository.existsByEmailIgnoreCase("retailer@example.test")).thenReturn(true);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service().registerNewUser(request(" RETAILER@example.test "))).getStatusCode().value());
        verifyNoInteractions(factory);
    }
    @Test void generatedUsernameIsCheckedBeforeFactoryCreatesAccount() {
        when(repository.existsByUsernameIgnoreCase("retailer")).thenReturn(true);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service().registerNewUser(request("retailer@other.test"))).getStatusCode().value());
        verifyNoInteractions(factory);
    }
    @Test void validRegistrationNormalizesEmailAndGeneratesUsername() {
        var request = request(" RETAILER@example.test "); var user = user(6);
        when(factory.createUser(request)).thenReturn(user);
        assertSame(user, service().registerNewUser(request));
        assertEquals("retailer@example.test", request.getEmail()); assertEquals("retailer", request.getUsername());
        verify(repository).existsByEmailIgnoreCase("retailer@example.test"); verify(repository).existsByUsernameIgnoreCase("retailer");
    }
    @Test void explicitUsernameIsTrimmedAndChecked() {
        var request = request("buyer@example.test"); request.setUsername(" Retailer ");
        when(repository.existsByUsernameIgnoreCase("Retailer")).thenReturn(true);
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service().registerNewUser(request)).getStatusCode().value());
        verifyNoInteractions(factory);
    }
    @Test void malformedRegistrationDoesNotReachPersistence() {
        var request = request("not-email");
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service().registerNewUser(request)).getStatusCode().value());
        verifyNoInteractions(repository, factory);
    }
    @Test void missingPasswordIsRejected() {
        var request = request("buyer@example.test"); request.setPassword(null);
        assertEquals(400, assertThrows(ResponseStatusException.class, () -> service().registerNewUser(request)).getStatusCode().value());
        verifyNoInteractions(repository, factory);
    }
    @Test void duplicateExistingIdentityReturnsConflictInsteadOfServerError() {
        when(repository.findByUsernameOrEmailList("retailer@example.test")).thenReturn(List.of(user(5), user(6)));
        assertEquals(409, assertThrows(ResponseStatusException.class, () -> service().signIn(request("retailer@example.test"))).getStatusCode().value());
        verifyNoInteractions(manager, jwt);
    }
    @Test void uniqueRetailerSignsInAndKeepsItsUserId() {
        var user = user(6); var request = request(" retailer@example.test ");
        when(repository.findByUsernameOrEmailList("retailer@example.test")).thenReturn(List.of(user));
        var authentication = new UsernamePasswordAuthenticationToken(UserDetailsImpl.build(user), null, UserDetailsImpl.build(user).getAuthorities());
        when(manager.authenticate(any())).thenReturn(authentication); when(jwt.generateJwtToken(authentication, "retailer")).thenReturn("fixture-token");
        assertEquals("fixture-token", service().signIn(request)); assertEquals(6L, ((UserDetailsImpl)authentication.getPrincipal()).getId());
    }
    @Test void wrongPasswordCannotReceiveToken() {
        when(manager.authenticate(any())).thenThrow(new BadCredentialsException("invalid"));
        assertNull(service().signIn(request("retailer@example.test"))); verifyNoInteractions(jwt);
    }
    @Test void wrongClientRoleCannotReceiveToken() {
        var user = user(6); var request = request("retailer@example.test"); request.setClientId("farm");
        when(manager.authenticate(any())).thenReturn(new UsernamePasswordAuthenticationToken(UserDetailsImpl.build(user), null, UserDetailsImpl.build(user).getAuthorities()));
        assertNull(service().signIn(request)); verifyNoInteractions(jwt);
    }
    private UserDetailsServiceImpl details() {
        var service = new UserDetailsServiceImpl(); ReflectionTestUtils.setField(service, "userRepository", repository); return service;
    }
    @Test void userDetailsNeverSelectFirstOfDuplicateAccounts() {
        when(repository.findByUsernameOrEmailList("retailer")).thenReturn(List.of(user(5), user(6)));
        assertThrows(UsernameNotFoundException.class, () -> details().loadUserByUsername("retailer"));
    }
    @Test void uniqueUserDetailsCanLoadByUsernameOrEmail() {
        when(repository.findByUsernameOrEmailList("retailer@example.test")).thenReturn(List.of(user(6)));
        assertEquals(6L, ((UserDetailsImpl)details().loadUserByUsername(" retailer@example.test ")).getId());
    }
    @Test void registrationConflictAndUniqueConstraintRaceProduce409() throws Exception {
        var service = mock(IAuthenticationUser.class); var controller = new AuthController(); ReflectionTestUtils.setField(controller, "authenticationUser", service);
        var mvc = MockMvcBuilders.standaloneSetup(controller).setControllerAdvice(new GlobalExceptionHandler()).build();
        when(service.registerNewUser(any())).thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Email already used"));
        mvc.perform(post("/api/auth/register").contentType("application/json").content("{}")).andExpect(status().isConflict()).andExpect(jsonPath("$.error").value("Email already used"));
        doThrow(new DataIntegrityViolationException("private sql")).when(service).registerNewUser(any());
        mvc.perform(post("/api/auth/register").contentType("application/json").content("{}")).andExpect(status().isConflict()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("private sql"))));
    }
    @Test void registrationResponseDoesNotExposePassword() throws Exception {
        var service = mock(IAuthenticationUser.class); when(service.registerNewUser(any())).thenReturn(user(6));
        var controller = new AuthController(); ReflectionTestUtils.setField(controller, "authenticationUser", service);
        MockMvcBuilders.standaloneSetup(controller).build().perform(post("/api/auth/register").contentType("application/json").content("{}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(6)).andExpect(jsonPath("$.password").doesNotExist());
    }
    @Test void initializerDoesNotDuplicateExistingAdminWithDifferentEmail() throws Exception {
        when(repository.count()).thenReturn(6L);
        when(repository.existsByUsernameIgnoreCase("admin")).thenReturn(true);
        var roles = mock(com.bicap.auth.repository.RoleRepository.class); when(roles.count()).thenReturn(6L);
        new com.bicap.auth.util.DatabaseInitializer(roles, repository, mock(org.springframework.security.crypto.password.PasswordEncoder.class)).run();
        verify(repository, never()).save(any());
    }
    @Test void initializerDoesNotDuplicateExistingAdminEmail() throws Exception {
        when(repository.existsByEmailIgnoreCase("admin@bicap.com")).thenReturn(true);
        var roles = mock(com.bicap.auth.repository.RoleRepository.class); when(roles.count()).thenReturn(6L);
        new com.bicap.auth.util.DatabaseInitializer(roles, repository, mock(org.springframework.security.crypto.password.PasswordEncoder.class)).run();
        verify(repository, never()).save(any());
    }
}
