package com.rentit.rental_service.config;

import com.rentit.rental_service.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/css/**", "/js/**").permitAll()
                        .requestMatchers("/api/register", "/api/user/me").permitAll()
                        .requestMatchers("/api/assets", "/api/assets/history").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .defaultSuccessUrl("/", true)
                        .permitAll()
                )
                .logout(logout -> logout.logoutSuccessUrl("/").permitAll());

        return http.build();
    }
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            com.rentit.rental_service.model.User user = userRepository.findByUsername(username);
            if (user == null) throw new UsernameNotFoundException("Nie ma takiego użytkownika: " + username);

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password(user.getPassword())
                    .roles(user.getRole().replace("ROLE_", ""))
                    .build();
        };
    }
}