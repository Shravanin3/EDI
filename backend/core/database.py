from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from core.config import config

# Initialize the database engine
engine = create_engine(
    config.DATABASE_URL, 
    # Pool pre_ping ensures connections aren't dropped randomly
    pool_pre_ping=True 
)

# Thread-safe session registry for Flask
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """
    Creates all tables in the database.
    This must be imported and called in main.py before the first request.
    """
    # Import all models here so SQLAlchemy registers them before table creation
    import models.audit_models
    import models.graph_models
    # import models.user_models
    # import models.rule_models
    # import models.pr_models
    
    Base.metadata.create_all(bind=engine)
    print("[INFO] Database tables initialized successfully.")