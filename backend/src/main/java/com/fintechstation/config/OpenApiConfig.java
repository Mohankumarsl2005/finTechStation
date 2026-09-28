package com.fintechstation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI finTechStationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FinTechStation Enterprise API")
                        .description("High-frequency multi-asset market terminal, scanner, technical analysis, and London Strategic Edge engine.")
                        .version("1.0.0")
                        .contact(new Contact().name("FinTechStation Engineering Team").email("api@fintechstation.io"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")));
    }
}
