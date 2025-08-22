package com.taskmate.task_mate.models;

import java.util.List;

public class TasksResponse {
    private List<Task> tasks;
    private PaginationInfo pagination;

    // Getters
    public List<Task> getTasks() { return tasks; }
    public PaginationInfo getPagination() { return pagination; }

    // Setters
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}