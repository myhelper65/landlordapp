package com.property.platform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /uploads/ ile başlayan istekleri, projenin ana dizinindeki uploads klasörüne yönlendirir
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}