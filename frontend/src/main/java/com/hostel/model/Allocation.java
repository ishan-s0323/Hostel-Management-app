package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Allocation {
    private int id;
    private int studentId;
    private String studentName;
    private int roomId;
    private String roomNumber;
    private String allocatedDate;
    private String releasedDate;
    private String status;
    private String notes;
    private int allocatedBy;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public String getAllocatedDate() { return allocatedDate; }
    public void setAllocatedDate(String allocatedDate) { this.allocatedDate = allocatedDate; }
    public String getReleasedDate() { return releasedDate; }
    public void setReleasedDate(String releasedDate) { this.releasedDate = releasedDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public int getAllocatedBy() { return allocatedBy; }
    public void setAllocatedBy(int allocatedBy) { this.allocatedBy = allocatedBy; }
}
