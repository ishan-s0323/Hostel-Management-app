package com.hostel.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AuditLog {
    private int id;
    private String entityType;
    private int entityId;
    private String action;
    private String oldValues;
    private String newValues;
    private String performerName;
    private String performerType;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public int getEntityId() { return entityId; }
    public void setEntityId(int entityId) { this.entityId = entityId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getOldValues() { return oldValues; }
    public void setOldValues(String oldValues) { this.oldValues = oldValues; }
    public String getNewValues() { return newValues; }
    public void setNewValues(String newValues) { this.newValues = newValues; }
    public String getPerformerName() { return performerName; }
    public void setPerformerName(String performerName) { this.performerName = performerName; }
    public String getPerformerType() { return performerType; }
    public void setPerformerType(String performerType) { this.performerType = performerType; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
