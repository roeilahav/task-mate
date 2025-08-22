package com.taskmate.task_mate.network;

import com.taskmate.task_mate.models.ApiResponse;
import com.taskmate.task_mate.models.CreateTaskRequest;
import com.taskmate.task_mate.models.RegisterRequest;
import com.taskmate.task_mate.models.Task;
import com.taskmate.task_mate.models.TaskStats;
import com.taskmate.task_mate.models.TasksResponse;
import com.taskmate.task_mate.models.UpdateTaskRequest;
import com.taskmate.task_mate.models.User;

import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface ApiService {

    // Get all tasks
    @GET("tasks")
    Call<ApiResponse<TasksResponse>> getTasks();

    // Create new task
    @POST("tasks")
    Call<ApiResponse<Task>> createTask(@Body CreateTaskRequest request);

    // Update task
    @PUT("tasks/{id}")
    Call<ApiResponse<Task>> updateTask(@Path("id") String taskId, @Body UpdateTaskRequest request);

    // Delete task
    @DELETE("tasks/{id}")
    Call<ApiResponse<Void>> deleteTask(@Path("id") String taskId);

    // Mark task complete
    @POST("tasks/{id}/complete")
    Call<ApiResponse<Task>> markTaskComplete(@Path("id") String taskId);

    // Mark task incomplete
    @POST("tasks/{id}/incomplete")
    Call<ApiResponse<Task>> markTaskIncomplete(@Path("id") String taskId);

    // Get task statistics
    @GET("tasks/stats/overview")
    Call<ApiResponse<TaskStats>> getTaskStatistics();

    // User registration
    @POST("auth/register")
    Call<ApiResponse<User>> registerUser(@Body RegisterRequest request);

    // Get user profile
    @GET("auth/profile")
    Call<ApiResponse<User>> getUserProfile();
}