package com.taskmate.task_mate.models;

public class User {
    private String _id;
    private String firebaseUid;
    private String email;
    private String displayName;
    private String photoURL;

    // Getters
    public String getId() { return _id; }
    public String getFirebaseUid() { return firebaseUid; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getPhotoURL() { return photoURL; }
}