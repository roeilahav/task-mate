package com.taskmate.task_mate.models;

public class CreateTaskRequest {
    private String title;
    private String description;
    private String dueDate;
    private String priority;
    private String category;

    public CreateTaskRequest(String title, String description, String priority, String category) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
    }

    // Getters
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDueDate() { return dueDate; }
    public String getPriority() { return priority; }
    public String getCategory() { return category; }

    // Setters
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public void setPriority(String priority) { this.priority = priority; }
    public void setCategory(String category) { this.category = category; }
}