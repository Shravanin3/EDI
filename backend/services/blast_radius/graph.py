import networkx as nx
from models.graph_models import OAuthUser, Script, DriveFile, script_file_scope


def build_network_graph(db_session):
    """
    Queries PostgreSQL for all users, scripts, and Drive files.
    Constructs a NetworkX DAG where:
      - Nodes: users, scripts, drive files
      - Edges: user→script (ownership), script→file (OAuth scope access)
    Returns a D3-compatible dict: { nodes, edges }
    """
    G = nx.DiGraph()

    users = db_session.query(OAuthUser).all()
    scripts = db_session.query(Script).all()
    files = db_session.query(DriveFile).all()

    for u in users:
        G.add_node(f'user_{u.id}', type='user', label=u.email)

    for s in scripts:
        G.add_node(f'script_{s.id}', type='script', label=s.name)
        G.add_edge(f'user_{s.owner_id}', f'script_{s.id}', relation='owns')

    for f in files:
        G.add_node(f'file_{f.id}', type='file', label=f.name)

    # Script → File edges via OAuth scopes
    scope_rows = db_session.execute(script_file_scope.select()).fetchall()
    for row in scope_rows:
        G.add_edge(
            f'script_{row.script_id}',
            f'file_{row.drive_file_id}',
            scope=row.scope,
            weight=row.sensitivity_weight,
        )

    nodes = [{'id': n, **G.nodes[n]} for n in G.nodes]
    edges = [{'source': u, 'target': v} for u, v in G.edges]

    return {'nodes': nodes, 'edges': edges}


def get_graph_object(db_session):
    """Returns the raw NetworkX DiGraph for use by the simulator."""
    G = nx.DiGraph()

    scripts = db_session.query(Script).all()
    files = db_session.query(DriveFile).all()
    users = db_session.query(OAuthUser).all()

    for u in users:
        G.add_node(f'user_{u.id}', type='user', label=u.email)
    for s in scripts:
        G.add_node(f'script_{s.id}', type='script', label=s.name)
        G.add_edge(f'user_{s.owner_id}', f'script_{s.id}')
    for f in files:
        G.add_node(f'file_{f.id}', type='file', label=f.name, weight=f.sensitivity_weight)

    scope_rows = db_session.execute(script_file_scope.select()).fetchall()
    for row in scope_rows:
        G.add_edge(
            f'script_{row.script_id}',
            f'file_{row.drive_file_id}',
            weight=row.sensitivity_weight,
        )

    return G
