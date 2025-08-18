import sys

def parse_input():
    input_lines = sys.stdin.read().strip().splitlines()
    schedules = []
    current = []

    for line in input_lines:
        line = line.strip()
        if line == "T":
            if current:
                schedules.append(current)
                current = []
        else:
            time_str, op_str = line.split(",")
            time = int(time_str.strip())
            if op_str.startswith("READ("):
                op_type = "R"
                var = op_str[5:-1]
            elif op_str.startswith("WRITE("):
                op_type = "W"
                var = op_str[6:-1]
            else:
                continue
            current.append((time, op_type, var))
    if current:
        schedules.append(current)
    return schedules

def build_operations(schedules):
    ops = []
    for tid, trans in enumerate(schedules):
        for (time, op_type, var) in trans:
            ops.append((time, tid, op_type, var))
    ops.sort()  # sort by timestamp
    return ops

def is_conflict(op1, op2):
    return op1[2] != 'R' or op2[2] != 'R'  # At least one must be WRITE

def build_precedence_graph(ops):
    graph = {}
    n = max(tid for _, tid, _, _ in ops) + 1
    for i in range(n):
        graph[i] = set()

    for i in range(len(ops)):
        time_i, tid_i, type_i, var_i = ops[i]
        for j in range(i + 1, len(ops)):
            time_j, tid_j, type_j, var_j = ops[j]
            if tid_i != tid_j and var_i == var_j and is_conflict(ops[i], ops[j]):
                graph[tid_i].add(tid_j)
    return graph

def has_cycle(graph):
    visited = set()
    rec_stack = set()

    def dfs(v):
        visited.add(v)
        rec_stack.add(v)
        for neighbor in graph[v]:
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True
        rec_stack.remove(v)
        return False

    for node in graph:
        if node not in visited:
            if dfs(node):
                return True
    return False

def main():
    schedules = parse_input()
    ops = build_operations(schedules)
    graph = build_precedence_graph(ops)
    print("0" if has_cycle(graph) else "1")

if __name__ == "__main__":
    main()
