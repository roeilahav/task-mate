package com.taskmate.task_mate.ui.home;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.taskmate.task_mate.R;
import com.taskmate.task_mate.TaskDetailActivity;
import com.taskmate.task_mate.adapters.TaskAdapter;
import com.taskmate.task_mate.databinding.FragmentHomeBinding;
import com.taskmate.task_mate.models.ApiResponse;
import com.taskmate.task_mate.models.CreateTaskRequest;
import com.taskmate.task_mate.models.RegisterRequest;
import com.taskmate.task_mate.models.Task;
import com.taskmate.task_mate.models.TasksResponse;
import com.taskmate.task_mate.models.User;
import com.taskmate.task_mate.network.ApiClient;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HomeFragment extends Fragment implements TaskAdapter.OnTaskClickListener {

    private FragmentHomeBinding binding;
    private TaskAdapter taskAdapter;
    private List<Task> taskList = new ArrayList<>();
    private static final String TAG = "HomeFragment";

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        View root = binding.getRoot();

        setupRecyclerView();
        setupClickListeners();
        setupFirebaseAuth();

        return root;
    }

    private void setupRecyclerView() {
        taskAdapter = new TaskAdapter(this);
        binding.recyclerViewTasks.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.recyclerViewTasks.setAdapter(taskAdapter);
    }

    private void setupClickListeners() {
        // Debug FAB
        Log.d(TAG, "Setting up click listeners...");

        if (binding.fabAddTask != null) {
            Log.d(TAG, "FAB found in binding");
            binding.fabAddTask.setOnClickListener(v -> {
                Log.d(TAG, "FAB clicked!");
                Toast.makeText(getContext(), "Creating new task...", Toast.LENGTH_SHORT).show();
                showAddTaskDialog();
            });

            // Make sure FAB is visible
            binding.fabAddTask.setVisibility(View.VISIBLE);
            binding.fabAddTask.show();

        } else {
            Log.e(TAG, "FAB is null in binding!");
        }

        // ADD THIS: Temporary button listener
        if (binding.btnAddTaskTemp != null) {
            binding.btnAddTaskTemp.setOnClickListener(v -> {
                Log.d(TAG, "Temp button clicked!");
                Toast.makeText(getContext(), "Creating new task...", Toast.LENGTH_SHORT).show();
                showAddTaskDialog();
            });
        }

        // Swipe to refresh
        binding.swipeRefresh.setOnRefreshListener(this::loadTasks);
    }

    private void setupFirebaseAuth() {
        FirebaseUser currentUser = FirebaseAuth.getInstance().getCurrentUser();
        if (currentUser != null) {
            // Get Firebase token and register user (if needed)
            currentUser.getIdToken(true)
                    .addOnCompleteListener(task -> {
                        if (task.isSuccessful()) {
                            String idToken = task.getResult().getToken();
                            ApiClient.setAuthToken(idToken);

                            // Register user with backend (will create or find existing)
                            registerUserWithBackend(currentUser);
                        } else {
                            Log.e(TAG, "Failed to get Firebase token", task.getException());
                            showError("Authentication failed");
                        }
                    });
        } else {
            showError("User not logged in");
        }
    }

    private void registerUserWithBackend(FirebaseUser firebaseUser) {
        RegisterRequest request = new RegisterRequest(
                firebaseUser.getDisplayName() != null ? firebaseUser.getDisplayName() : "User"
        );

        ApiClient.getApiService().registerUser(request)
                .enqueue(new Callback<ApiResponse<User>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            Log.d(TAG, "User registered/found successfully");
                            // Now load tasks
                            loadTasks();
                        } else {
                            Log.e(TAG, "Failed to register user: " + response.code());
                            // Still try to load tasks
                            loadTasks();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                        Log.e(TAG, "Register user network error", t);
                        // Still try to load tasks
                        loadTasks();
                    }
                });
    }

    private void loadTasks() {
        Log.d(TAG, "Loading tasks...");
        binding.progressBar.setVisibility(View.VISIBLE);

        ApiClient.getApiService().getTasks()
                .enqueue(new Callback<ApiResponse<TasksResponse>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<TasksResponse>> call, Response<ApiResponse<TasksResponse>> response) {
                        binding.progressBar.setVisibility(View.GONE);
                        binding.swipeRefresh.setRefreshing(false);

                        if (response.isSuccessful() && response.body() != null) {
                            ApiResponse<TasksResponse> apiResponse = response.body();
                            if (apiResponse.isSuccess() && apiResponse.getData() != null) {
                                taskList = apiResponse.getData().getTasks();
                                taskAdapter.submitList(new ArrayList<>(taskList));
                                updateEmptyState();
                                Log.d(TAG, "Loaded " + taskList.size() + " tasks");
                            } else {
                                Log.e(TAG, "API error: " + apiResponse.getError());
                                showError("Failed to load tasks: " + apiResponse.getError());
                            }
                        } else {
                            Log.e(TAG, "HTTP error: " + response.code());
                            showError("Failed to load tasks: " + response.code());
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<TasksResponse>> call, Throwable t) {
                        binding.progressBar.setVisibility(View.GONE);
                        binding.swipeRefresh.setRefreshing(false);
                        Log.e(TAG, "Network error loading tasks", t);
                        showError("Network error: " + t.getMessage());
                    }
                });
    }

    private void updateEmptyState() {
        if (taskList.isEmpty()) {
            binding.emptyState.setVisibility(View.VISIBLE);
            binding.recyclerViewTasks.setVisibility(View.GONE);
        } else {
            binding.emptyState.setVisibility(View.GONE);
            binding.recyclerViewTasks.setVisibility(View.VISIBLE);
        }
    }

    private void showAddTaskDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        builder.setTitle("Create New Task");

        // Create dialog layout
        LinearLayout layout = new LinearLayout(getContext());
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(50, 20, 50, 20);

        // Title input
        EditText titleInput = new EditText(getContext());
        titleInput.setHint("Task title *");
        layout.addView(titleInput);

        // Description input
        EditText descriptionInput = new EditText(getContext());
        descriptionInput.setHint("Description (optional)");
        layout.addView(descriptionInput);

        // Priority spinner
        Spinner prioritySpinner = new Spinner(getContext());
        ArrayAdapter<String> priorityAdapter = new ArrayAdapter<>(getContext(),
                android.R.layout.simple_spinner_item, new String[]{"low", "medium", "high"});
        priorityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        prioritySpinner.setAdapter(priorityAdapter);
        prioritySpinner.setSelection(1); // Default to medium
        layout.addView(prioritySpinner);

        // Category input
        EditText categoryInput = new EditText(getContext());
        categoryInput.setHint("Category (e.g., work, personal)");
        categoryInput.setText("general");
        layout.addView(categoryInput);

        builder.setView(layout);

        builder.setPositiveButton("Create", (dialog, which) -> {
            String title = titleInput.getText().toString().trim();
            String description = descriptionInput.getText().toString().trim();
            String priority = prioritySpinner.getSelectedItem().toString();
            String category = categoryInput.getText().toString().trim();

            if (title.isEmpty()) {
                Toast.makeText(getContext(), "Title is required", Toast.LENGTH_SHORT).show();
                return;
            }

            createTask(title, description, priority, category);
        });

        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void createTask(String title, String description, String priority, String category) {
        Log.d(TAG, "Creating task: " + title);
        binding.progressBar.setVisibility(View.VISIBLE);

        CreateTaskRequest request = new CreateTaskRequest(title, description, priority, category);

        ApiClient.getApiService().createTask(request)
                .enqueue(new Callback<ApiResponse<Task>>() {
                    @Override
                    public void onResponse(Call<ApiResponse<Task>> call, Response<ApiResponse<Task>> response) {
                        binding.progressBar.setVisibility(View.GONE);

                        if (response.isSuccessful() && response.body() != null) {
                            ApiResponse<Task> apiResponse = response.body();
                            if (apiResponse.isSuccess()) {
                                Task newTask = apiResponse.getData();
                                taskList.add(0, newTask);
                                taskAdapter.submitList(new ArrayList<>(taskList));
                                updateEmptyState();
                                Toast.makeText(getContext(), "Task created!", Toast.LENGTH_SHORT).show();
                                Log.d(TAG, "Task created successfully");
                            } else {
                                showError("Failed to create task: " + apiResponse.getError());
                            }
                        } else {
                            showError("Failed to create task: " + response.code());
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse<Task>> call, Throwable t) {
                        binding.progressBar.setVisibility(View.GONE);
                        Log.e(TAG, "Network error creating task", t);
                        showError("Network error: " + t.getMessage());
                    }
                });
    }

    // TaskAdapter.OnTaskClickListener implementation
    @Override
    public void onTaskClick(Task task) {
        // Navigate to task details
        Intent intent = new Intent(getActivity(), TaskDetailActivity.class);
        intent.putExtra("task_id", task.getId());
        intent.putExtra("task_title", task.getTitle());
        intent.putExtra("task_description", task.getDescription());
        intent.putExtra("task_priority", task.getPriority());
        intent.putExtra("task_category", task.getCategory());
        intent.putExtra("task_completed", task.isCompleted());
        startActivity(intent);
    }

    @Override
    public void onTaskToggle(Task task, boolean isCompleted) {
        Log.d(TAG, "Toggling task: " + task.getTitle() + " to " + isCompleted);

        String endpoint = isCompleted ? "complete" : "incomplete";
        Call<ApiResponse<Task>> call = isCompleted ?
                ApiClient.getApiService().markTaskComplete(task.getId()) :
                ApiClient.getApiService().markTaskIncomplete(task.getId());

        call.enqueue(new Callback<ApiResponse<Task>>() {
            @Override
            public void onResponse(Call<ApiResponse<Task>> call, Response<ApiResponse<Task>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    ApiResponse<Task> apiResponse = response.body();
                    if (apiResponse.isSuccess()) {
                        // Update task in list
                        for (int i = 0; i < taskList.size(); i++) {
                            if (taskList.get(i).getId().equals(task.getId())) {
                                taskList.get(i).setCompleted(isCompleted);
                                break;
                            }
                        }
                        taskAdapter.submitList(new ArrayList<>(taskList));
                        Toast.makeText(getContext(),
                                isCompleted ? "Task completed!" : "Task marked incomplete",
                                Toast.LENGTH_SHORT).show();
                    } else {
                        showError("Failed to update task: " + apiResponse.getError());
                        // Revert checkbox
                        taskAdapter.notifyDataSetChanged();
                    }
                } else {
                    showError("Failed to update task: " + response.code());
                    // Revert checkbox
                    taskAdapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Task>> call, Throwable t) {
                Log.e(TAG, "Network error updating task", t);
                showError("Network error: " + t.getMessage());
                // Revert checkbox
                taskAdapter.notifyDataSetChanged();
            }
        });
    }

    private void showError(String message) {
        if (getContext() != null) {
            Toast.makeText(getContext(), message, Toast.LENGTH_LONG).show();
        }
        Log.e(TAG, message);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}