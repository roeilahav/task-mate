package com.taskmate.task_mate.models;

public class Task {
    private String _id;
    private String title;
    private String description;
    private String dueDate;
    private String priority;
    private String status;
    private String category;
    private boolean isCompleted;
    private String createdAt;
    private String updatedAt;

    // Constructors
    public Task() {}

    public Task(String title, String description, String priority, String category) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
    }

    // Getters and Setters
    public String getId() { return _id; }
    public void setId(String id) { this._id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }

    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }

    // Helper method for UI colors
    public int getPriorityColor() {
        switch (priority != null ? priority : "medium") {
            case "high": return 0xFFFF5722; // Red
            case "medium": return 0xFFFF9800; // Orange
            case "low": return 0xFF4CAF50; // Green
            default: return 0xFF9E9E9E; // Grey
        }
    }
}