package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Room {
    private int id;
    private String roomNumber;
    private int capacity;
    private int currentOccupancy;
    private String roomType;
    private double rentPerMonth;
    private int floorNum;
    private String block;
    private String status;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
    public int getCurrentOccupancy() { return currentOccupancy; }
    public void setCurrentOccupancy(int currentOccupancy) { this.currentOccupancy = currentOccupancy; }
    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }
    public double getRentPerMonth() { return rentPerMonth; }
    public void setRentPerMonth(double rentPerMonth) { this.rentPerMonth = rentPerMonth; }
    public int getFloorNum() { return floorNum; }
    public void setFloorNum(int floorNum) { this.floorNum = floorNum; }
    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
