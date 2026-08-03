package com.finmitra.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/finmitra_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String rawUrl = dbUrl;
        String dbUser = username;
        String dbPassword = password;

        // Handle embedded user:password@ in JDBC or postgres:// URLs
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                String cleanUrl = rawUrl.replace("jdbc:", "");
                URI uri = new URI(cleanUrl);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    dbUser = userInfo[0];
                    if (userInfo.length > 1) {
                        dbPassword = userInfo[1];
                    }
                }

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrlBuilder = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append(path);

                if (query != null && !query.isEmpty()) {
                    jdbcUrlBuilder.append("?").append(query);
                } else {
                    jdbcUrlBuilder.append("?sslmode=require");
                }

                rawUrl = jdbcUrlBuilder.toString();
            } catch (Exception e) {
                System.err.println("Failed to parse custom database URI, falling back to raw URL: " + e.getMessage());
            }
        } else if (rawUrl != null && rawUrl.startsWith("jdbc:postgresql://") && rawUrl.contains("@")) {
            try {
                int atIndex = rawUrl.indexOf("@");
                int prefixIndex = "jdbc:postgresql://".length();
                String userInfoStr = rawUrl.substring(prefixIndex, atIndex);
                String restOfUrl = rawUrl.substring(atIndex + 1);

                String[] parts = userInfoStr.split(":");
                dbUser = parts[0];
                if (parts.length > 1) {
                    dbPassword = parts[1];
                }

                rawUrl = "jdbc:postgresql://" + restOfUrl;
            } catch (Exception e) {
                System.err.println("Failed to parse embedded user:pass in JDBC URL: " + e.getMessage());
            }
        }

        // Clean any incompatible query parameters if present
        if (rawUrl != null && rawUrl.contains("&channel_binding=")) {
            rawUrl = rawUrl.replaceAll("&channel_binding=[^&]*", "");
        }
        if (rawUrl != null && rawUrl.contains("?channel_binding=")) {
            rawUrl = rawUrl.replaceAll("\\?channel_binding=[^&]*", "?").replaceAll("\\?\\s*$", "");
        }

        config.setJdbcUrl(rawUrl);
        if (dbUser != null && !dbUser.trim().isEmpty()) {
            config.setUsername(dbUser);
        }
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            config.setPassword(dbPassword);
        }
        if (driverClassName != null && !driverClassName.trim().isEmpty()) {
            config.setDriverClassName(driverClassName);
        }

        return new HikariDataSource(config);
    }
}
