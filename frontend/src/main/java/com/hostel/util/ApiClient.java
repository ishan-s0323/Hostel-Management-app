package com.hostel.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

public class ApiClient {

    private static final String BASE_URL = "http://localhost:5000/api";
    private static final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private static final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public static ObjectMapper getMapper() { return mapper; }

    public static JsonNode get(String path) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .GET()
                .header("Content-Type", "application/json");
        addAuth(builder);
        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    public static JsonNode post(String path, Map<String, Object> body) throws IOException, InterruptedException {
        String json = mapper.writeValueAsString(body);
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .header("Content-Type", "application/json");
        addAuth(builder);
        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    public static JsonNode put(String path, Map<String, Object> body) throws IOException, InterruptedException {
        String json = body != null ? mapper.writeValueAsString(body) : "{}";
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .PUT(HttpRequest.BodyPublishers.ofString(json))
                .header("Content-Type", "application/json");
        addAuth(builder);
        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    public static JsonNode delete(String path) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .DELETE()
                .header("Content-Type", "application/json");
        addAuth(builder);
        HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        return handleResponse(response);
    }

    public static void downloadCsv(String path, String filePath) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .GET()
                .header("Accept", "text/csv");
        addAuth(builder);
        HttpResponse<byte[]> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(response.body());
            }
        } else {
            throw new IOException("Download failed: HTTP " + response.statusCode());
        }
    }

    public static ObjectNode createObjectNode() {
        return mapper.createObjectNode();
    }

    private static void addAuth(HttpRequest.Builder builder) {
        String token = SessionManager.getToken();
        if (token != null && !token.isEmpty()) {
            builder.header("Authorization", "Bearer " + token);
        }
    }

    private static JsonNode handleResponse(HttpResponse<String> response) throws IOException {
        String body = response.body();
        if (body == null || body.isEmpty()) {
            return mapper.createObjectNode();
        }
        JsonNode node = mapper.readTree(body);
        if (response.statusCode() >= 400) {
            String message = "Request failed: HTTP " + response.statusCode();
            if (node.has("error")) {
                message = node.get("error").asText();
            } else if (node.has("message")) {
                message = node.get("message").asText();
            }
            throw new IOException(message);
        }
        return node;
    }
}
