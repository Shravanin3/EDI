from collections import deque
from services.blast_radius.graph import get_graph_object
from models.graph_models import DriveFile


def run_bfs_simulation(script_id: str, db_session):
    """
    Executes a weighted BFS from the compromised script node.

    Predictive Blast Radius formula:
        score = Σ (sensitivity_weight(file) / hop_distance)

    Returns:
        blast_radius_pct  – normalised 0-100 score
        rows              – list of impacted nodes with depth & risk level
    """
    G = get_graph_object(db_session)

    node_id = f'script_{script_id}' if not str(script_id).startswith('script_') else script_id

    if node_id not in G:
        return {'blast_radius_pct': 0.0, 'rows': []}

    # BFS traversal
    visited = {node_id: 0}   # node → hop distance
    queue = deque([node_id])
    impacted_files = []       # (file_node_id, hop_distance, sensitivity_weight)

    while queue:
        current = queue.popleft()
        current_depth = visited[current]

        for neighbor in G.successors(current):
            if neighbor not in visited:
                hop = current_depth + 1
                visited[neighbor] = hop
                queue.append(neighbor)

                node_data = G.nodes[neighbor]
                if node_data.get('type') == 'file':
                    w = G.edges[current, neighbor].get('weight', node_data.get('weight', 0.5))
                    impacted_files.append((neighbor, hop, w))

    # Decay score: Σ weight / hop
    raw_score = sum(w / hop for _, hop, w in impacted_files)

    # Normalise to 0-100 (cap at 100)
    blast_radius_pct = round(min(raw_score * 100, 100.0), 1)

    # Build response rows
    rows = []
    for file_node, hop, weight in sorted(impacted_files, key=lambda x: x[1]):
        label = G.nodes[file_node].get('label', file_node)
        risk = _risk_level(weight)
        rows.append({
            'target': label,
            'type': 'file',
            'risk': risk,
            'exposure': f'{round(weight * 100)}%',
            'depth': hop,
        })

    return {'blast_radius_pct': blast_radius_pct, 'rows': rows}


def _risk_level(weight: float) -> str:
    if weight >= 0.7:
        return 'danger'
    if weight >= 0.4:
        return 'warning'
    return 'safe'
