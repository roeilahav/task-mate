package com.taskmate.task_mate.models;

public class PaginationInfo {
    private int page;
    private int limit;
    private int total;
    private int pages;
    private boolean hasNext;
    private boolean hasPrev;

    // Getters
    public int getPage() { return page; }
    public int getLimit() { return limit; }
    public int getTotal() { return total; }
    public int getPages() { return pages; }
    public boolean isHasNext() { return hasNext; }
    public boolean isHasPrev() { return hasPrev; }
}