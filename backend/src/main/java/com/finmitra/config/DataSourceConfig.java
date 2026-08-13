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

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/finmitra_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:TushNIIT123#}")
    private String password;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String rawUrl = dbUrl;
        String dbUser = username;
        String dbPassword = password;
        String selectedDriver = driverClassName;

        // Handle embedded user:password@ in mysql:// or postgres:// URLs
        if (rawUrl != null && (rawUrl.startsWith("mysql://") || rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                boolean isMysql = rawUrl.startsWith("mysql://");
                String scheme = isMysql ? "http://" : "http://"; // use http scheme to parse generic authority safely
                String cleanUrl = rawUrl.replaceFirst("^(mysql|postgres|postgresql)://", scheme);
                URI uri = new URI(cleanUrl);

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    dbUser = java.net.URLDecoder.decode(userInfo[0], java.nio.charset.StandardCharsets.UTF_8);
                    if (userInfo.length > 1) {
                        dbPassword = java.net.URLDecoder.decode(userInfo[1], java.nio.charset.StandardCharsets.UTF_8);
                    }
                }

                String host = uri.getHost();
                int defaultPort = isMysql ? 3306 : 5432;
                int port = uri.getPort() == -1 ? defaultPort : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrlBuilder = new StringBuilder(isMysql ? "jdbc:mysql://" : "jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append(path);

                if (query != null && !query.isEmpty()) {
                    jdbcUrlBuilder.append("?").append(query);
                } else if (!isMysql) {
                    jdbcUrlBuilder.append("?sslmode=require");
                }

                rawUrl = jdbcUrlBuilder.toString();
                selectedDriver = isMysql ? "com.mysql.cj.jdbc.Driver" : "org.postgresql.Driver";
            } catch (Exception e) {
                System.err.println("Failed to parse custom database URI, falling back to raw URL: " + e.getMessage());
            }
        } else if (rawUrl != null && (rawUrl.startsWith("jdbc:postgresql://") || rawUrl.startsWith("jdbc:mysql://")) && rawUrl.contains("@")) {
            try {
                boolean isMysql = rawUrl.startsWith("jdbc:mysql://");
                String prefix = isMysql ? "jdbc:mysql://" : "jdbc:postgresql://";
                int atIndex = rawUrl.indexOf("@");
                int prefixIndex = prefix.length();
                String userInfoStr = rawUrl.substring(prefixIndex, atIndex);
                String restOfUrl = rawUrl.substring(atIndex + 1);

                String[] parts = userInfoStr.split(":", 2);
                dbUser = java.net.URLDecoder.decode(parts[0], java.nio.charset.StandardCharsets.UTF_8);
                if (parts.length > 1) {
                    dbPassword = java.net.URLDecoder.decode(parts[1], java.nio.charset.StandardCharsets.UTF_8);
                }

                rawUrl = prefix + restOfUrl;
                selectedDriver = isMysql ? "com.mysql.cj.jdbc.Driver" : "org.postgresql.Driver";
            } catch (Exception e) {
                System.err.println("Failed to parse embedded user:pass in JDBC URL: " + e.getMessage());
            }
        }

        // Clean any incompatible query parameters if present (e.g. Prisma's channel_binding)
        if (rawUrl != null && rawUrl.contains("&channel_binding=")) {
            rawUrl = rawUrl.replaceAll("&channel_binding=[^&]*", "");
        }
        if (rawUrl != null && rawUrl.contains("?channel_binding=")) {
            rawUrl = rawUrl.replaceAll("\\?channel_binding=[^&]*", "?").replaceAll("\\?\\s*$", "");
        }

        // Auto-detect driver if PostgreSQL/NeonDB URL is detected
        if (rawUrl != null && (rawUrl.startsWith("jdbc:postgresql://") || rawUrl.contains("postgres") || rawUrl.contains("neon.tech"))) {
            selectedDriver = "org.postgresql.Driver";
        } else if (selectedDriver == null || selectedDriver.trim().isEmpty()) {
            selectedDriver = "com.mysql.cj.jdbc.Driver";
        }

        config.setJdbcUrl(rawUrl);
        if (dbUser != null && !dbUser.trim().isEmpty()) {
            config.setUsername(dbUser);
        }
        if (dbPassword != null && !dbPassword.trim().isEmpty()) {
            config.setPassword(dbPassword);
        }
        if (selectedDriver != null && !selectedDriver.trim().isEmpty()) {
            config.setDriverClassName(selectedDriver);
        }

        return new HikariDataSource(config);
    }
}
