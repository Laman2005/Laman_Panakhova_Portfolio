#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_TXNS 100  // Maximum number of transactions
#define MAX_OPS 1000    // Maximum number of operations in total
#define MAX_LINE 100    // Maximum length of each input line

// We create structure to represent each operation in the schedule
typedef struct {
    int time;   // Timestamp of the operation
    char op_type[10];   // Operation type: READ or WRITE
    char item[10];    // Item on which operation is performed 
    int txn_id;   // Transaction ID that this operation belongs to 
} Operation;

// Node structure for representing an edge in the dependency graph
typedef struct Node {
    int dest;   // Destination transaction 
    struct Node* next;  // Pointer to the next node in adjacency list - LINKED LIST
} Node;


// Global arrays
Operation schedule[MAX_OPS];     // List of all operations
int txn_count = 0;               // Total number of transactions
int op_count = 0;                // Total number of operations
int txn_op_start[MAX_TXNS];      // Index where each transaction's operations start in the schedule

Node* graph[MAX_TXNS];           // Adjacency list representation of precedence (conflict) graph

// Adds a directed edge in the graph from one transaction to another
void add_edge(int from, int to) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->dest = to;
    node->next = graph[from];
    graph[from] = node;
}

// Comparator for sorting operations by time
int compare_ops(const void* a, const void* b) {
    return ((Operation*)a)->time - ((Operation*)b)->time;
}

// Helper function for cycle detection using DFS
int has_cycle_util(int node, int* visited) {
    if (visited[node] == 1) return 1;  // Cycle found
    if (visited[node] == 2) return 0;  // Already visited and safe

    visited[node] = 1; // Mark as visiting
    Node* temp = graph[node];
    while (temp) {
        if (has_cycle_util(temp->dest, visited)) return 1;
        temp = temp->next;
    }
    visited[node] = 2; // Mark as visited and no cycle found from here
    return 0;
}

// Detects if the graph has a cycle (non-serializable)
int has_cycle(int num_nodes) {
    int visited[MAX_TXNS] = {0};
    for (int i = 0; i < num_nodes; i++) {
        if (visited[i] == 0) {
            if (has_cycle_util(i, visited)) return 1;
        }
    }
    return 0;
}

// main starts here 
int main() {
    char line[MAX_LINE];
    int current_txn = -1;

    // Read input line by line
    while (fgets(line, sizeof(line), stdin)) {
        if (line[0] == '\n' || line[0] == '\0') continue;

        // If line starts with 'T', it's a new transaction
        if (line[0] == 'T') {
            current_txn++;
            txn_op_start[current_txn] = op_count;  // Track where this transaction's ops start
        } else {
            int time;
            char operation[20];

            // Parse line format: <time>,<operation>
            sscanf(line, "%d,%s", &time, operation);

            char op_type[10], item[10];
            sscanf(operation, "%[^()](%[^)])", op_type, item);  // Extract op_type and item

            // Fill in the operation structure
            strcpy(schedule[op_count].op_type, op_type);
            strcpy(schedule[op_count].item, item);
            schedule[op_count].time = time;
            schedule[op_count].txn_id = current_txn;
            op_count++;
        }
    }

    txn_count = current_txn + 1; // Final transaction count

    // Sort operations by their timestamps to simulate actual schedule order
    qsort(schedule, op_count, sizeof(Operation), compare_ops);
    // Build the precedence (conflict) graph based on conflicting operations
    for (int i = 0; i < op_count; i++) {
        for (int j = i + 1; j < op_count; j++) {
            // Check if operations from different transactions access the same item
            if (schedule[i].txn_id != schedule[j].txn_id &&
                strcmp(schedule[i].item, schedule[j].item) == 0 &&
                (strcmp(schedule[i].op_type, "WRITE") == 0 ||
                 strcmp(schedule[j].op_type, "WRITE") == 0)) {
                // There is a conflict: add edge from txn i to txn j
                add_edge(schedule[i].txn_id, schedule[j].txn_id);
            }
        }
    }

    // Check if the schedule is conflict-serializable (no cycles)
    printf("%d\n", has_cycle(txn_count) ? 0 : 1);  // 1 = serializable, 0 = not

    // Cleanup: Free all graph memory
    for (int i = 0; i < txn_count; i++) {
        Node* temp = graph[i];
        while (temp) {
            Node* to_free = temp;
            temp = temp->next;
            free(to_free);
        }
    }

    return 0;
}
