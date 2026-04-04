package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Fee {
    private int id;
    private int studentId;
    private String studentName;
    private String feeType;
    private double amount;
    private String dueDate;
    private String status;
    private String paidDate;
    private String paymentMethod;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getFeeType() { return feeType; }
    public void setFeeType(String feeType) { this.feeType = feeType; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaidDate() { return paidDate; }
    public void setPaidDate(String paidDate) { this.paidDate = paidDate; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
