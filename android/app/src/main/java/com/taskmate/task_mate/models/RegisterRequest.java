package com.taskmate.task_mate.models;

public class RegisterRequest {
    private String displayName;
    private String fcmToken;

    public RegisterRequest(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() { return displayName; }
    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
}