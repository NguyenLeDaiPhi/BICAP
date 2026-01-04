package com.bicap.trading_order_service.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
public class InMemoryUserConfig {

    @Bean
public UserDetailsService userDetailsService() {
    UserDetails retailer = User
        .withUsername("retailer")
        .password("{noop}123456")
        .roles("RETAILER")
        .build();

    return new InMemoryUserDetailsManager(retailer);
}

}
