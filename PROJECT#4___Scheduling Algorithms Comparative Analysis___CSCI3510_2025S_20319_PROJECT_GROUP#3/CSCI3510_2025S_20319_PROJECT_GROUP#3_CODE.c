#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>

#define MAX_PROCESSES 10

typedef struct {
    int pid;
    int arrival;
    int burst;
    int priority;
    int start;
    int end;
    int completion;
    int turnaround;
    int waiting;
    int first_response;
} Process;

int compare_arrival(const void *a, const void *b) {
    return ((Process *)a)->arrival - ((Process *)b)->arrival;
}

void generate_processes(Process p[], int n, int is_uniform) {
    for (int i = 0; i < n; i++) {
        p[i].pid = i + 1;
        p[i].arrival = is_uniform ? i * 2 : rand() % 10;
        p[i].burst = is_uniform ? 5 : (rand() % 9 + 1);
        p[i].priority = is_uniform ? i + 1 : (rand() % 10 + 1);
        p[i].first_response = -1;
    }
}

void print_processes(Process p[], int n) {
    printf("\n%-8s%-10s%-8s%-8s%-8s%-12s%-12s%-10s\n",
           "Process", "Arrival", "Burst", "Start", "End", "Completion", "Turnaround", "Waiting");
    for (int i = 0; i < n; i++) {
        printf("P%-7d%-10d%-8d%-8d%-8d%-12d%-12d%-10d\n",
               p[i].pid, p[i].arrival, p[i].burst, p[i].start, p[i].end, p[i].completion, p[i].turnaround, p[i].waiting);
    }
}

void calculate_avg_times(Process p[], int n) {
    float total_waiting = 0, total_turnaround = 0, total_response = 0;
    for (int i = 0; i < n; i++) {
        total_waiting += p[i].waiting;
        total_turnaround += p[i].turnaround;
        total_response += p[i].first_response - p[i].arrival;
    }
    float mean_waiting = total_waiting / n;
    float wt_var = 0;
    for (int i = 0; i < n; i++) {
        wt_var += (p[i].waiting - mean_waiting) * (p[i].waiting - mean_waiting);
    }
    wt_var = sqrt(wt_var / n);

    printf("\nAverage Waiting Time: %.2f\n", total_waiting / n);
    printf("Average Turnaround Time: %.2f\n", total_turnaround / n);
    printf("Average Response Time: %.2f\n", total_response / n);
    printf("Waiting Time Variance Deviation: %.2f\n", wt_var);
}

// FCFS
void fcfs(Process p[], int n) {
    qsort(p, n, sizeof(Process), compare_arrival);
    int time = 0;
    for (int i = 0; i < n; i++) {
        if (time < p[i].arrival) time = p[i].arrival;
        p[i].start = time;
        p[i].first_response = time;
        time += p[i].burst;
        p[i].end = time;
        p[i].completion = time;
        p[i].turnaround = p[i].completion - p[i].arrival;
        p[i].waiting = p[i].turnaround - p[i].burst;
    }
    printf("\n--- First-Come First-Served (FCFS) ---\n");
    print_processes(p, n);
    calculate_avg_times(p, n);
}

// SJF (Non-preemptive)
void sjf(Process p[], int n) {
    qsort(p, n, sizeof(Process), compare_arrival);
    int time = 0, count = 0;
    int completed_flags[MAX_PROCESSES] = {0};

    while (count < n) {
        int idx = -1, min_burst = 1e9;
        for (int i = 0; i < n; i++) {
            if (!completed_flags[i] && p[i].arrival <= time && p[i].burst < min_burst) {
                min_burst = p[i].burst;
                idx = i;
            }
        }
        if (idx == -1) {
            time++;
            continue;
        }
        p[idx].start = time;
        p[idx].first_response = time;
        time += p[idx].burst;
        p[idx].end = time;
        p[idx].completion = time;
        p[idx].turnaround = time - p[idx].arrival;
        p[idx].waiting = p[idx].turnaround - p[idx].burst;
        completed_flags[idx] = 1;
        count++;
    }

    printf("\n--- Shortest Job First (SJF, Non-preemptive) ---\n");
    print_processes(p, n);
    calculate_avg_times(p, n);
}

// Priority Scheduling (Non-preemptive)
void priority_scheduling(Process p[], int n) {
    qsort(p, n, sizeof(Process), compare_arrival);
    int time = 0, count = 0;
    int completed_flags[MAX_PROCESSES] = {0};

    while (count < n) {
        int idx = -1, high_priority = 1e9;
        for (int i = 0; i < n; i++) {
            if (!completed_flags[i] && p[i].arrival <= time && p[i].priority < high_priority) {
                high_priority = p[i].priority;
                idx = i;
            }
        }
        if (idx == -1) {
            time++;
            continue;
        }
        p[idx].start = time;
        p[idx].first_response = time;
        time += p[idx].burst;
        p[idx].end = time;
        p[idx].completion = time;
        p[idx].turnaround = p[idx].completion - p[idx].arrival;
        p[idx].waiting = p[idx].turnaround - p[idx].burst;
        completed_flags[idx] = 1;
        count++;
    }

    printf("\n--- Priority Scheduling (Non-preemptive) ---\n");
    print_processes(p, n);
    calculate_avg_times(p, n);
}

// Round Robin (Improved)
void round_robin(Process p[], int n, int quantum) {
    int rem_burst[MAX_PROCESSES];
    int complete = 0, time = 0;
    int done[MAX_PROCESSES] = {0};

    for (int i = 0; i < n; i++) {
        rem_burst[i] = p[i].burst;
        p[i].first_response = -1;
    }

    while (complete < n) {
        int executed = 0;
        for (int i = 0; i < n; i++) {
            if (p[i].arrival <= time && rem_burst[i] > 0) {
                if (p[i].first_response == -1) {
                    p[i].first_response = time;
                }
                int exec_time = (rem_burst[i] < quantum) ? rem_burst[i] : quantum;
                time += exec_time;
                rem_burst[i] -= exec_time;

                if (rem_burst[i] == 0 && !done[i]) {
                    p[i].completion = time;
                    p[i].turnaround = p[i].completion - p[i].arrival;
                    p[i].waiting = p[i].turnaround - p[i].burst;
                    p[i].start = p[i].first_response;
                    p[i].end = p[i].completion;
                    complete++;
                    done[i] = 1;
                }
                executed = 1;
            }
        }
        if (!executed) time++;
    }

    printf("\n--- Round Robin (Quantum = %d) ---\n", quantum);
    print_processes(p, n);
    calculate_avg_times(p, n);
}

int main() {
    srand(time(NULL));
    int n, dist_type;
    printf("Enter number of processes (max %d): ", MAX_PROCESSES);
    scanf("%d", &n);
    if (n <= 0 || n > MAX_PROCESSES) {
        printf("Invalid number of processes.\n");
        return 1;
    }
    printf("Select process generation type:\n1. Random\n2. Uniform\nEnter choice: ");
    scanf("%d", &dist_type);
    if (dist_type != 1 && dist_type != 2) {
        printf("Invalid distribution type selected.\n");
        return 1;
    }

    Process processes[MAX_PROCESSES];
    generate_processes(processes, n, dist_type == 2); // 2 = Uniform

    // Make copies for each algorithm
    Process copy1[MAX_PROCESSES], copy2[MAX_PROCESSES], copy3[MAX_PROCESSES], copy4[MAX_PROCESSES];
    for (int i = 0; i < n; i++) {
        copy1[i] = copy2[i] = copy3[i] = copy4[i] = processes[i];
    }

    fcfs(copy1, n);
    sjf(copy2, n);
    priority_scheduling(copy3, n);
    round_robin(copy4, n, 4);

    return 0;
}
