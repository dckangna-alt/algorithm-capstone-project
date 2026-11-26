"""Graph-colouring algorithms for exam timetable generation."""
import time

STEP_LIMIT = 4_000_000


def parse_students(text):
    """'Name: DAA, OS' per line -> [(name, [subjects])]"""
    students = []
    for line in text.splitlines():
        if ":" not in line:
            continue
        name, subs = line.split(":", 1)
        subjects = list(dict.fromkeys(s.strip().upper() for s in subs.split(",") if s.strip()))
        if subjects:
            students.append((name.strip(), subjects))
    return students


def build_graph(students):
    """Vertices = subjects, edge = at least one student takes both."""
    names = sorted({s for _, subs in students for s in subs})
    idx = {n: i for i, n in enumerate(names)}
    adj = [set() for _ in names]
    count = [0] * len(names)
    edges = set()
    for _, subs in students:
        for s in subs:
            count[idx[s]] += 1
        for a in range(len(subs)):
            for b in range(a + 1, len(subs)):
                i, j = idx[subs[a]], idx[subs[b]]
                adj[i].add(j); adj[j].add(i)
                edges.add((min(i, j), max(i, j)))
    return names, adj, count, sorted(edges)


def greedy_coloring(adj, order):
    """Welsh-Powell greedy colouring, O(V^2)."""
    color = [-1] * len(adj)
    for v in order:
        used = {color[u] for u in adj[v]}
        c = 0
        while c in used:
            c += 1
        color[v] = c
    return color


def backtracking_coloring(adj, order, log):
    """Try m = 1, 2, 3 ... colours; first m that works is the chromatic number."""
    n = len(adj)
    steps = back = 0
    for m in range(1, n + 1):
        color = [-1] * n
        s0, b0 = steps, back
        limit = False

        def solve(k, used):
            nonlocal steps, back, limit
            if k == n:
                return True
            v = order[k]
            for c in range(min(used, m - 1) + 1):          # symmetry breaking
                if any(color[u] == c for u in adj[v]):      # safe-colour check
                    continue
                color[v] = c
                steps += 1
                if steps > STEP_LIMIT:
                    limit = True
                    return False
                if solve(k + 1, max(used, c + 1)):
                    return True
                if limit:
                    return False
                color[v] = -1                               # backtrack
                back += 1
            return False

        ok = solve(0, 0)
        log.append(f"m = {m} slots -> {'SUCCESS' if ok else 'fail'} "
                   f"({steps - s0} assignments, {back - b0} backtracks)")
        if ok:
            return {"c": color, "m": m, "steps": steps, "back": back}
        if limit:
            return None
    return None


def generate(text):
    students = parse_students(text)
    if not students:
        raise ValueError("Add at least one line like  Name: DAA, OS")
    names, adj, count, edges = build_graph(students)
    n = len(names)
    order = sorted(range(n), key=lambda v: -len(adj[v]))   # highest degree first
    log = []

    t = time.perf_counter(); g_col = greedy_coloring(adj, order); g_time = (time.perf_counter() - t) * 1000
    t = time.perf_counter(); res = backtracking_coloring(adj, order, log); b_time = (time.perf_counter() - t) * 1000
    fallback = res is None
    if fallback:
        res = {"c": g_col, "m": max(g_col) + 1, "steps": STEP_LIMIT, "back": 0}
        log.append("Step limit reached - using greedy result")
    log.append("Vertex order (highest degree first): " + ", ".join(f"{names[v]}({len(adj[v])})" for v in order))

    col = res["c"]
    load = []
    for slot in range(res["m"]):
        in_slot = {i for i, c in enumerate(col) if c == slot}
        load.append(sum(1 for _, subs in students if any(s in {names[i] for i in in_slot} for s in subs)))
    return {
        "g": {"names": names, "E": [list(e) for e in edges], "cnt": count},
        "b": res, "gm": max(g_col) + 1, "gt": g_time, "bt": b_time,
        "bad": sum(1 for i, j in edges if col[i] == col[j]),
        "fb": fallback, "log": log, "load": load, "students": len(students),
    }
