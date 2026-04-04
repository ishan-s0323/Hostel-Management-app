package com.hostel.util;

import com.fasterxml.jackson.databind.JsonNode;

public class SessionManager {

    private static String token;
    private static JsonNode currentUser;
    private static String userRole;

    public static void setToken(String t) { token = t; }
    public static String getToken() { return token; }

    public static void setCurrentUser(JsonNode user) {
        currentUser = user;
        if (user != null && user.has("role")) {
            userRole = user.get("role").asText();
        }
    }

    public static JsonNode getCurrentUser() { return currentUser; }
    public static String getUserRole() { return userRole; }

    public static boolean isAdmin() {
        return "admin".equals(userRole) || "superadmin".equals(userRole);
    }

    public static int getUserId() {
        if (currentUser != null && currentUser.has("id")) {
            return currentUser.get("id").asInt();
        }
        return -1;
    }

    public static String getUserName() {
        if (currentUser != null && currentUser.has("name")) {
            return currentUser.get("name").asText();
        }
        return "User";
    }

    public static void clear() {
        token = null;
        currentUser = null;
        userRole = null;
    }

    public static boolean isLoggedIn() {
        return token != null && !token.isEmpty();
    }
}
