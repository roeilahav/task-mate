package com.taskmate.task_mate.models;

public class TaskStats {
    private int totalTasks;
    private int completedTasks;
    private int pendingTasks;
    private int overdueTasks;
    private int completionRate;

    // Getters
    public int getTotalTasks() { return totalTasks; }
    public int getCompletedTasks() { return completedTasks; }
    public int getPendingTasks() { return pendingTasks; }
    public int getOverdueTasks() { return overdueTasks; }
    public int getCompletionRate() { return completionRate; }
}