package com.bicap.auth.config;

import com.bicap.auth.service.UserDetailsImpl;
import com.bicap.auth.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAccountIdentityTests {
    private final JwtUtils jwt = mock(JwtUtils.class);
    private final UserDetailsServiceImpl users = mock(UserDetailsServiceImpl.class);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter();
    @BeforeEach void setUp() {
        SecurityContextHolder.clearContext();
        ReflectionTestUtils.setField(filter, "jwtUtils", jwt);
        ReflectionTestUtils.setField(filter, "userDetailsService", users);
        when(jwt.validateToken("fixture-token")).thenReturn(true);
        when(jwt.getUserNameFromJwtToken("fixture-token")).thenReturn("retailer");
        when(jwt.getUserIdFromJwtToken("fixture-token")).thenReturn(6L);
    }
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    private UserDetailsImpl user(String username, boolean enabled) {
        return new UserDetailsImpl(6L, username, "retailer@example.test", "private-hash", List.of(new SimpleGrantedAuthority("ROLE_RETAILER")), enabled);
    }
    private void invoke() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/update/profile"); request.addHeader("Authorization", "Bearer fixture-token");
        filter.doFilterInternal(request, new MockHttpServletResponse(), new MockFilterChain());
    }
    @Test void authenticatesExactUserIdFromSignedToken() throws Exception {
        when(users.loadUserById(6L)).thenReturn(user("retailer", true)); invoke();
        assertEquals(6L, ((UserDetailsImpl)SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId());
        verify(users, never()).loadUserByUsername(any());
    }
    @Test void deletedAccountTokenNeverFallsBackToAnotherAccountWithSameUsername() throws Exception {
        when(jwt.getUserIdFromJwtToken("fixture-token")).thenReturn(5L);
        when(users.loadUserById(5L)).thenThrow(new UsernameNotFoundException("User not found")); invoke();
        assertNull(SecurityContextHolder.getContext().getAuthentication()); verify(users, never()).loadUserByUsername(any());
    }
    @Test void tokenSubjectMustMatchItsAccount() throws Exception {
        when(users.loadUserById(6L)).thenReturn(user("another-account", true)); invoke();
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
    @Test void blockedAccountIsNotAuthenticatedByExistingToken() throws Exception {
        when(users.loadUserById(6L)).thenReturn(user("retailer", false)); invoke();
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
    @Test void tokenWithoutUserIdIsNotResolvedByAmbiguousUsername() throws Exception {
        when(jwt.getUserIdFromJwtToken("fixture-token")).thenReturn(null); invoke();
        assertNull(SecurityContextHolder.getContext().getAuthentication()); verifyNoInteractions(users);
    }
}
