from abc import ABC, abstractmethod
from typing import Any, Dict
import os
import psycopg2
from datetime import datetime

class BaseAgent(ABC):
    """Abstract base class for all modular agents"""
    
    def __init__(self, org_id: str, config: Dict[str, Any] = None):
        self.org_id = org_id
        self.config = config or {}
        self.db_conn = None
    
    def connect_db(self):
        """Connect to PostgreSQL database"""
        if not self.db_conn:
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                self.db_conn = psycopg2.connect(database_url)
        return self.db_conn
    
    def close_db(self):
        """Close database connection"""
        if self.db_conn:
            self.db_conn.close()
            self.db_conn = None
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main execution method - must be implemented by each agent
        
        Args:
            input_data: Input data for the agent
            
        Returns:
            Dict with result and metadata
        """
        pass
    
    async def log_execution(
        self, 
        module_id: str, 
        task_id: str, 
        status: str, 
        output: Any = None, 
        error: str = None
    ):
        """Log execution to database"""
        try:
            conn = self.connect_db()
            cursor = conn.cursor()
            
            cursor.execute(
                """
                INSERT INTO module_executions 
                (module_id, task_id, status, output, error, org_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (module_id, task_id, status, str(output), error, self.org_id)
            )
            
            conn.commit()
        except Exception as e:
            print(f"Failed to log execution: {e}")
        finally:
            if cursor:
                cursor.close()
    
    def validate_org_access(self, resource_id: str, table: str) -> bool:
        """Ensure multi-tenant isolation"""
        try:
            conn = self.connect_db()
            cursor = conn.cursor()
            
            cursor.execute(
                f"SELECT org_id FROM {table} WHERE id = %s",
                (resource_id,)
            )
            
            result = cursor.fetchone()
            cursor.close()
            
            if result and result[0] == self.org_id:
                return True
            return False
        except Exception as e:
            print(f"Validation error: {e}")
            return False
