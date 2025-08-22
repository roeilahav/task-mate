package com.taskmate.task_mate.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

import com.taskmate.task_mate.R;
import com.taskmate.task_mate.models.Task;

public class TaskAdapter extends ListAdapter<Task, TaskAdapter.TaskViewHolder> {

    private OnTaskClickListener listener;

    public interface OnTaskClickListener {
        void onTaskClick(Task task);
        void onTaskToggle(Task task, boolean isCompleted);
    }

    public TaskAdapter(OnTaskClickListener listener) {
        super(DIFF_CALLBACK);
        this.listener = listener;
    }

    private static final DiffUtil.ItemCallback<Task> DIFF_CALLBACK = new DiffUtil.ItemCallback<Task>() {
        @Override
        public boolean areItemsTheSame(@NonNull Task oldItem, @NonNull Task newItem) {
            return oldItem.getId().equals(newItem.getId());
        }

        @Override
        public boolean areContentsTheSame(@NonNull Task oldItem, @NonNull Task newItem) {
            return oldItem.getTitle().equals(newItem.getTitle()) &&
                    oldItem.isCompleted() == newItem.isCompleted() &&
                    oldItem.getPriority().equals(newItem.getPriority());
        }
    };

    @NonNull
    @Override
    public TaskViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_task, parent, false);
        return new TaskViewHolder(itemView);
    }

    @Override
    public void onBindViewHolder(@NonNull TaskViewHolder holder, int position) {
        Task currentTask = getItem(position);
        holder.bind(currentTask);
    }

    class TaskViewHolder extends RecyclerView.ViewHolder {
        private TextView taskTitle;
        private TextView taskDescription;
        private TextView taskPriority;
        private TextView taskCategory;
        private CheckBox taskCheckbox;
        private View priorityIndicator;

        public TaskViewHolder(@NonNull View itemView) {
            super(itemView);
            taskTitle = itemView.findViewById(R.id.taskTitle);
            taskDescription = itemView.findViewById(R.id.taskDescription);
            taskPriority = itemView.findViewById(R.id.taskPriority);
            taskCategory = itemView.findViewById(R.id.taskCategory);
            taskCheckbox = itemView.findViewById(R.id.taskCheckbox);
            priorityIndicator = itemView.findViewById(R.id.priorityIndicator);

            // Set click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION) {
                        listener.onTaskClick(getItem(position));
                    }
                }
            });

            taskCheckbox.setOnClickListener(v -> {
                if (listener != null) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION) {
                        listener.onTaskToggle(getItem(position), taskCheckbox.isChecked());
                    }
                }
            });
        }

        public void bind(Task task) {
            taskTitle.setText(task.getTitle());

            if (task.getDescription() != null && !task.getDescription().isEmpty()) {
                taskDescription.setText(task.getDescription());
                taskDescription.setVisibility(View.VISIBLE);
            } else {
                taskDescription.setVisibility(View.GONE);
            }

            taskPriority.setText(task.getPriority() != null ? task.getPriority().toUpperCase() : "MEDIUM");
            taskCategory.setText(task.getCategory() != null ? task.getCategory() : "General");

            taskCheckbox.setChecked(task.isCompleted());

            // Set priority indicator color
            priorityIndicator.setBackgroundColor(task.getPriorityColor());

            // Style completed tasks
            if (task.isCompleted()) {
                taskTitle.setAlpha(0.6f);
                taskDescription.setAlpha(0.6f);
            } else {
                taskTitle.setAlpha(1.0f);
                taskDescription.setAlpha(1.0f);
            }
        }
    }
}