import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import configurations and database setup

from core.config import config
from core.database import db_session, init_db

# ==========================================
# APP INITIALIZATION
# ==========================================

app = Flask(__name__)

# Allow the React frontend to communicate with Flask

CORS(app, resources={r"/api/*": {"origins": "*"}})

OAUTH_SCOPES_MAP = {}

def load_oauth_scopes():
    """Loads the CSV into a high-speed Hash Map on startup."""
    global OAUTH_SCOPES_MAP
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'google_oauth_scopes.csv')
    try:
        df = pd.read_csv(csv_path)
        OAUTH_SCOPES_MAP = df.set_index('scope').to_dict(orient='index')
        print(f"[INFO] Successfully loaded {len(OAUTH_SCOPES_MAP)} OAuth scopes.")
    except Exception as e:
        print(f"[ERROR] Failed to load OAuth scopes CSV: {e}")

@app.before_request
def setup():
    init_db()
    load_oauth_scopes()

# ==========================================
# MODULE 1: OVERVIEW (Samrudhi)
# ==========================================

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_metrics():

    # EXPECTED JSON PAYLOAD FROM SAMRUDHI:
    # {
    #   "res_score": 84,
    #   "res_sparkline_30d": [70, 75, 80, 84],  <-- For the Sparkline
    #   "risk_distribution": {"red": 12, "yellow": 34, "green": 105}, <-- For Stacked Bar
    #   "quadrant_data": [{"file": "1_Invoice.gs", "sprawl": 0.8, "intent_mismatch": 0.9}]
    # }
    # from services.overview.dashboard import calculate_res_and_matrix
    # return jsonify(calculate_res_and_matrix(db_session, OAUTH_SCOPES_MAP)), 200

    return jsonify({"status": "Dashboard endpoint active"}), 200

@app.route('/api/anomalies', methods=['GET'])
def get_recent_anomalies():

    # EXPECTED JSON PAYLOAD FROM SAMRUDHI:
    # {
    #   "live_feed": [{"timestamp": "...", "script": "Rogue.gs", "score": -0.9}],
    #   "heatmap_30d": [{"date": "2026-03-01", "anomaly_count": 4}] <-- For GitHub-style Calendar
    # }
    # from services.overview.anomaly import fetch_anomalies
    # return jsonify(fetch_anomalies(db_session)), 200

    return jsonify({"status": "Anomalies endpoint active"}), 200

# ==========================================
# MODULE 2: CODE RECONCILIATION (Paresh)
# ==========================================

@app.route('/api/scan/upload', methods=['POST'])
def upload_repository():

    # from services.reconciliation.scanner import process_upload
    # return jsonify(process_upload(request.files, request.json)), 201

    return jsonify({"status": "Upload endpoint active"}), 201

@app.route('/api/scan/<scan_id>/tree', methods=['GET'])
def get_file_tree(scan_id):

    # EXPECTED JSON PAYLOAD FROM PARESH:
    # {
    #   "directory_tree": {... nested dict for MUI FileTree ...},
    #   "treemap_weights": [{"name": "Invoice.gs", "size": 100}] <-- For Sunburst/Treemap Size
    # }
    # from services.reconciliation.file_tree import build_tree
    # return jsonify(build_tree(scan_id, OAUTH_SCOPES_MAP)), 200

    return jsonify({"status": f"File tree endpoint active for scan {scan_id}"}), 200

@app.route('/api/scan/file/<file_id>', methods=['GET'])
def get_file_inspection(file_id):

    # EXPECTED JSON PAYLOAD FROM PARESH:
    # {
    #   "ast_code": "...", "manifest_json": "...", "extracted_intent": "Calculates math...",
    #   "diff_overlay": ["https://mail.google.com/"] <-- Triggers Red highlight in JSON view
    # }
    # from services.reconciliation.inspector import inspect_file
    # return jsonify(inspect_file(file_id)), 200

    return jsonify({"status": f"File inspector active for file {file_id}"}), 200

# ==========================================
# MODULE 3: BLAST RADIUS (Shravani)
# ==========================================

@app.route('/api/scripts', methods=['GET'])
def list_scripts():
    from models.graph_models import Script
    scripts = db_session.query(Script).all()
    return jsonify([{'id': str(s.id), 'name': s.name} for s in scripts]), 200

@app.route('/api/graph/topology', methods=['GET'])
def get_graph_topology():
    from services.blast_radius.graph import build_network_graph
    return jsonify(build_network_graph(db_session)), 200

@app.route('/api/graph/simulate', methods=['POST'])
def simulate_breach():
    from services.blast_radius.simulator import run_bfs_simulation
    data = request.json or {}
    script_id = data.get('script_id') or data.get('node_id')
    if not script_id:
        return jsonify({'error': 'script_id is required'}), 400
    return jsonify(run_bfs_simulation(script_id, db_session)), 200

# ==========================================
# MODULE 4: TEMPORAL RISK (Samrudhi)
# ==========================================

@app.route('/api/policies/jit', methods=['GET', 'POST'])
def handle_jit_policies():

    # EXPECTED JSON PAYLOAD FROM SAMRUDHI:
    # {
    #   "rules": [{"scope": "drive", "ttl": 30}],
    #   "gantt_timeline": [{"token": "abc", "expires_on": "2026-04-01"}] <-- For Timeline Chart
    # }
    # from services.temporal_risk.scheduler import manage_policies
    # return jsonify(manage_policies(request, db_session)), 200

    return jsonify({"status": "JIT policies endpoint active"}), 200

@app.route('/api/analytics/decay', methods=['GET'])
def get_decay_analytics():

    # EXPECTED JSON PAYLOAD FROM SAMRUDHI:
    # { "decay_curves": [{"day": 1, "probability": 0.99}, {"day": 30, "probability": 0.01}] }
    # from services.temporal_risk.decay import calculate_decay_curves
    # return jsonify(calculate_decay_curves(db_session)), 200

    return jsonify({"status": "Decay analytics endpoint active"}), 200

# ==========================================
# MODULE 5: REMEDIATION CENTER (Prasanna)
# ==========================================

@app.route('/api/pr/generate', methods=['POST'])
def generate_pull_request():

    # data = request.json
    # from services.remediation.pr_creator import create_remediation_pr
    # return jsonify(create_remediation_pr(data, config.GEMINI_API_KEY)), 201

    return jsonify({"status": "PR generation endpoint active"}), 201

@app.route('/api/webhooks/github', methods=['POST'])
def github_webhook_receiver():

    # EXPECTED JSON PAYLOAD FROM PRASANNA (For the GET request equivalent of this data):
    # {
    #   "acceptance_rate": {"merged": 80, "rejected": 20}, <-- For the Donut Chart
    #   "ttr_history": [{"week": 1, "avg_hours": 12}, {"week": 2, "avg_hours": 4}] <-- For Bar Chart
    # }
    # verify_signature(request, config.GITHUB_WEBHOOK_SECRET)
    # from services.remediation.webhooks import process_pr_event
    # process_pr_event(request.json, db_session)

    return jsonify({"status": "Webhook received"}), 200

# ==========================================
# MODULE 6: AUDIT & COMPLIANCE (Atharva)
# ==========================================

@app.route('/api/audit/ledger', methods=['GET', 'POST'])
def manage_audit_ledger():

    # EXPECTED JSON PAYLOAD FROM ATHARVA:
    # {
    #   "logs": [{"time": "...", "action": "...", "hash": "..."}],
    #   "volume_histogram": [{"date": "2026-03-01", "events": 45}] <-- For the Scrubber Bar Chart
    # }
    # from services.audit.ledger import append_or_read_logs
    # return jsonify(append_or_read_logs(request, db_session)), 200

    return jsonify({"status": "Audit ledger endpoint active"}), 200

@app.route('/api/audit/forensics', methods=['GET'])
def get_historical_forensics():

    # target_date = request.args.get('date')
    # EXPECTED JSON PAYLOAD: Exact replica of the Posture Dashboard data + Network Topology data
    # from services.audit.forensics import rebuild_state_for_date
    # return jsonify(rebuild_state_for_date(target_date, db_session)), 200

    return jsonify({"status": "Forensics endpoint active"}), 200

# ==========================================
# SERVER EXECUTION
# ==========================================

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=(config.FLASK_ENV == 'development'))