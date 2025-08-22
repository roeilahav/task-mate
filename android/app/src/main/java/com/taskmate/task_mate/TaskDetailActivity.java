package com.taskmate.task_mate;

import android.content.Intent;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.taskmate.task_mate.databinding.ActivityTaskDetailBinding;
import com.taskmate.task_mate.models.Task;

public class TaskDetailActivity extends AppCompatActivity {

    private ActivityTaskDetailBinding binding;
    private Task currentTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        binding = ActivityTaskDetailBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        // Setup toolbar with back button
        setSupportActionBar(binding.toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setDisplayShowHomeEnabled(true);
            getSupportActionBar().setTitle("Task Details");
        }

        // Get task data from intent
        getTaskFromIntent();

        // Setup UI
        setupTaskDetails();
        setupClickListeners();
    }

    private void getTaskFromIntent() {
        Intent intent = getIntent();
        if (intent != null) {
            String taskId = intent.getStringExtra("task_id");
            String taskTitle = intent.getStringExtra("task_title");
            String taskDescription = intent.getStringExtra("task_description");
            String taskPriority = intent.getStringExtra("task_priority");
            String taskCategory = intent.getStringExtra("task_category");
            boolean isCompleted = intent.getBooleanExtra("task_completed", false);

            // Create task object from intent data
            currentTask = new Task();
            currentTask.setId(taskId);
            currentTask.setTitle(taskTitle);
            currentTask.setDescription(taskDescription);
            currentTask.setPriority(taskPriority);
            currentTask.setCategory(taskCategory);
            currentTask.setCompleted(isCompleted);
        }
    }

    private void setupTaskDetails() {
        if (currentTask != null) {
            binding.taskTitle.setText(currentTask.getTitle());
            binding.taskDescription.setText(currentTask.getDescription() != null ?
                    currentTask.getDescription() : "No description");
            binding.taskPriority.setText("Priority: " +
                    (currentTask.getPriority() != null ? currentTask.getPriority().toUpperCase() : "MEDIUM"));
            binding.taskCategory.setText("Category: " +
                    (currentTask.getCategory() != null ? currentTask.getCategory() : "General"));
            binding.taskStatus.setText("Status: " +
                    (currentTask.isCompleted() ? "Completed ✅" : "Pending ⏳"));

            // Set priority color
            binding.priorityIndicator.setBackgroundColor(currentTask.getPriorityColor());
        }
    }

    private void setupClickListeners() {
        // Edit button
        binding.btnEdit.setOnClickListener(v -> {
            Toast.makeText(this, "Edit functionality - Coming soon!", Toast.LENGTH_SHORT).show();
        });

        // Delete button
        binding.btnDelete.setOnClickListener(v -> {
            Toast.makeText(this, "Delete functionality - Coming soon!", Toast.LENGTH_SHORT).show();
        });

        // Toggle completion
        binding.btnToggleComplete.setOnClickListener(v -> {
            currentTask.setCompleted(!currentTask.isCompleted());
            setupTaskDetails();
            Toast.makeText(this,
                    currentTask.isCompleted() ? "Task completed!" : "Task marked pending",
                    Toast.LENGTH_SHORT).show();
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle back button press
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onBackPressed() {
        // Custom back behavior if needed
        super.onBackPressed();
        finish();
    }
}