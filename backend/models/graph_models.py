from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from core.database import Base

# Association table: which scopes a script has on a file
script_file_scope = Table(
    'script_file_scope', Base.metadata,
    Column('script_id', Integer, ForeignKey('scripts.id'), primary_key=True),
    Column('drive_file_id', Integer, ForeignKey('drive_files.id'), primary_key=True),
    Column('scope', String(255), primary_key=True),
    Column('sensitivity_weight', Float, default=1.0),
)


class OAuthUser(Base):
    __tablename__ = 'oauth_users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    clerk_id = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), nullable=False)

    def to_dict(self):
        return {'id': f'user_{self.id}', 'type': 'user', 'label': self.email}


class Script(Base):
    __tablename__ = 'scripts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey('oauth_users.id'), nullable=False)
    # Comma-separated OAuth scopes granted to this script
    granted_scopes = Column(String(1000), nullable=True)

    def to_dict(self):
        return {'id': f'script_{self.id}', 'type': 'script', 'label': self.name}


class DriveFile(Base):
    __tablename__ = 'drive_files'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey('oauth_users.id'), nullable=False)
    # Higher = more sensitive (0.0 – 1.0)
    sensitivity_weight = Column(Float, default=0.5, nullable=False)

    def to_dict(self):
        return {'id': f'file_{self.id}', 'type': 'file', 'label': self.name}
