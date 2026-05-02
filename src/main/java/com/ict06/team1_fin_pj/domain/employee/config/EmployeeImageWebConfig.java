package com.ict06.team1_fin_pj.domain.employee.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class EmployeeImageWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String employeeUploadPath = Paths.get(
                System.getProperty("user.dir"),
                "employee",
                "ict_06_uploads"
        ).toUri().toString();

        registry.addResourceHandler("/employee/uploads/**")
                .addResourceLocations(employeeUploadPath);
    }
}