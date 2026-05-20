import datetime
from models.audit_models import AuditLog

def rebuild_state_for_date(target_date_str, db_session):
    """
    Executes an Event-Sourcing state rebuild.
    Queries all immutable logs up to the requested historical date.
    """
    if not target_date_str:
        return {"error": "target_date is required in ISO 8601 format (YYYY-MM-DD)"}

    try:

        # Parse the string from the UI DatePicker into a Python datetime object

        target_date = datetime.datetime.fromisoformat(target_date_str.replace('Z', '+00:00'))
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}

    # Query all logs that occurred BEFORE or ON the target date

    historical_logs = db_session.query(AuditLog).filter(AuditLog.timestamp <= target_date).order_by(AuditLog.timestamp.asc()).all()

    # Reconstruct the system state based on the deltas
    # (In a full implementation, you would pass these logs to Shravani's Graph generator
    # and Paresh's File Tree generator to rebuild the exact UI elements.)
    
    reconstructed_state = {
        "historical_date_viewed": target_date.isoformat(),
        "total_events_replayed": len(historical_logs),
        "reconstructed_files": {}, # To be populated by File Tree logic
        "reconstructed_graph": {}  # To be populated by Graph logic
    }

    # Example replaying logic
    
    for log in historical_logs:
        if log.action_type == "SCAN_UPLOAD":
            reconstructed_state["reconstructed_files"][log.target_resource] = "scanned"
        elif log.action_type == "SCOPE_DOWNGRADE":
            reconstructed_state["reconstructed_files"][log.target_resource] = "remediated"

    return {
        "status": "success",
        "forensic_state": reconstructed_state
    }