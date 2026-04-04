package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Student {
    private int id;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private String course;
    private int year;
    private String guardianName;
    private String guardianPhone;
    private String status;
    private String createdAt;

    @JsonProperty("roomNumber")
    private String roomNumber;
    @JsonProperty("roomId")
    private Integer roomId;
    @JsonProperty("totalFees")
    private Double totalFees;
    @JsonProperty("paidFees")
    private Double paidFees;
    @JsonProperty("pendingFees")
    private Double pendingFees;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }
    public String getGuardianPhone() { return guardianPhone; }
    public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }
    public Double getTotalFees() { return totalFees; }
    public void setTotalFees(Double totalFees) { this.totalFees = totalFees; }
    public Double getPaidFees() { return paidFees; }
    public void setPaidFees(Double paidFees) { this.paidFees = paidFees; }
    public Double getPendingFees() { return pendingFees; }
    public void setPendingFees(Double pendingFees) { this.pendingFees = pendingFees; }
}
