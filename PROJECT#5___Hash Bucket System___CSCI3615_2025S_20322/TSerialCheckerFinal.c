#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_TXNS 100
#define MAX_OPS 1000
#define MAX_LINE 100

typedef struct {
    int time;
    char op_type[10];
    char item[10];
    int txn_id;
} Operation;

typedef struct Node {
    int dest;
    struct Node* next;
} Node;

Operation schedule[MAX_OPS];
int txn_count = 0;
int op_count = 0;
int txn_op_start[MAX_TXNS];
Node* graph[MAX_TXNS];

void add_edge(int from, int to) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->dest = to;
    node->next = graph[from];
    graph[from] = node;
}

int compare_ops(const void* a, const void* b) {
    return ((Operation*)a)->time - ((Operation*)b)->time;
}

int has_cycle_util(int node, int* visited) {
    if (visited[node] == 1) return 1;
    if (visited[node] == 2) return 0;

    visited[node] = 1;
    Node* temp = graph[node];
    while (temp) {
        if (has_cycle_util(temp->dest, visited)) return 1;
        temp = temp->next;
    }
    visited[node] = 2;
    return 0;
}

int has_cycle(int num_nodes) {
    int visited[MAX_TXNS] = {0};
    for (int i = 0; i < num_nodes; i++) {
        if (visited[i] == 0) {
            if (has_cycle_util(i, visited)) return 1;
        }
    }
    return 0;
}

int main() {
    FILE* file = fopen("test1.txt", "r");  
    if (!file) {
        printf("Error: Could not open file.\n");
        return 1;
    }

    char line[MAX_LINE];
    int current_txn = -1;

    while (fgets(line, sizeof(line), file)) {
        if (line[0] == '\n' || line[0] == '\0') continue;

        if (line[0] == 'T') {
            current_txn++;
            txn_op_start[current_txn] = op_count;
        } else {
            int time;
            char operation[20];
            sscanf(line, "%d,%s", &time, operation);
            char op_type[10], item[10];
            sscanf(operation, "%[^()](%[^)])", op_type, item);

            strcpy(schedule[op_count].op_type, op_type);
            strcpy(schedule[op_count].item, item);
            schedule[op_count].time = time;
            schedule[op_count].txn_id = current_txn;
            op_count++;
        }
    }
    fclose(file);

    txn_count = current_txn + 1;
    qsort(schedule, op_count, sizeof(Operation), compare_ops);

    for (int i = 0; i < op_count; i++) {
        for (int j = i + 1; j < op_count; j++) {
            if (schedule[i].txn_id != schedule[j].txn_id &&
                strcmp(schedule[i].item, schedule[j].item) == 0 &&
                (strcmp(schedule[i].op_type, "WRITE") == 0 ||
                 strcmp(schedule[j].op_type, "WRITE") == 0)) {
                add_edge(schedule[i].txn_id, schedule[j].txn_id);
            }
        }
    }

    printf("%s\n", has_cycle(txn_count) ? "0" : "1");

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
