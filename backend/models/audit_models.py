import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from core.database import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Automatically records the exact time the row was created
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # The Clerk User ID of the developer/admin making the change
    actor_id = Column(String(100), nullable=False) 
    
    # E.g., "SCAN_UPLOAD", "SCOPE_DOWNGRADE", "SIMULATION_RUN"
    action_type = Column(String(50), nullable=False) 
    
    # E.g., "1_InvoiceProcessor.gs"
    target_resource = Column(String(255), nullable=False) 
    
    # JSON string representing the exact change made
    delta_payload = Column(Text, nullable=True) 

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() + "Z",
            "actor_id": self.actor_id,
            "action_type": self.action_type,
            "target_resource": self.target_resource,
            "delta_payload": self.delta_payload
        }