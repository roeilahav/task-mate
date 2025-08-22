package com.taskmate.task_mate.models;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;
    private String message;

    // Getters
    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public String getError() { return error; }
    public String getMessage() { return message; }

    // Setters
    public void setSuccess(boolean success) { this.success = success; }
    public void setData(T data) { this.data = data; }
    public void setError(String error) { this.error = error; }
    public void setMessage(String message) { this.message = message; }
}