package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Notification {
    private int id;
    private int userId;
    private String userType;
    @JsonProperty("notifType")
    private String notifType;
    private String title;
    private String message;
    @JsonProperty("isRead")
    private int isRead;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public String getNotifType() { return notifType; }
    public void setNotifType(String notifType) { this.notifType = notifType; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public int getIsRead() { return isRead; }
    public void setIsRead(int isRead) { this.isRead = isRead; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
