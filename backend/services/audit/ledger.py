import json
from models.audit_models import AuditLog

def append_or_read_logs(req, db_session):
    """
    Handles GET (read) and POST (append) for the audit ledger.
    Strictly prohibits DELETE or PUT requests to enforce a SQL append-only architecture.
    """
    # ==========================================
    # READ LOGS (Auditor View)
    # ==========================================

    if req.method == 'GET':

        # Fetch the most recent 100 logs, ordered by newest first

        logs = db_session.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
        return {
            "status": "success",
            "logs": [log.to_dict() for log in logs]
        }

    # ==========================================
    # WRITE LOGS (Append-Only)
    # ==========================================

    elif req.method == 'POST':
        data = req.json
        
        # Create the new log object

        new_log = AuditLog(
            actor_id=data.get("actor_id", "SYSTEM"),
            action_type=data.get("action_type"),
            target_resource=data.get("target_resource"),
            delta_payload=json.dumps(data.get("delta_payload", {}))
        )

        # Save to PostgreSQL database
        
        db_session.add(new_log)
        db_session.commit()

        return {
            "status": "success", 
            "message": "Log successfully appended to database."
        }