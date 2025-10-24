from .base_agent import BaseAgent
from typing import Any, Dict

class DataAgent(BaseAgent):
    """Data Transformation Agent using pandas"""
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute data transformation task
        
        Args:
            input_data: Should contain 'data' key with data to process
            
        Returns:
            Dict with processed data and statistics
        """
        try:
            data = input_data.get("data", [])
            operation = input_data.get("operation", "describe")
            
            if not data:
                return {
                    "success": False,
                    "error": "No data provided for processing"
                }
            
            try:
                import pandas as pd
                
                df = pd.DataFrame(data)
                
                if operation == "describe":
                    result = df.describe().to_dict()
                    return {
                        "success": True,
                        "statistics": result,
                        "row_count": len(df),
                        "column_count": len(df.columns),
                        "columns": list(df.columns)
                    }
                
                elif operation == "summary":
                    return {
                        "success": True,
                        "row_count": len(df),
                        "column_count": len(df.columns),
                        "columns": list(df.columns),
                        "dtypes": df.dtypes.astype(str).to_dict(),
                        "sample": df.head(5).to_dict(orient="records")
                    }
                
                elif operation == "clean":
                    df_cleaned = df.dropna()
                    return {
                        "success": True,
                        "cleaned_data": df_cleaned.to_dict(orient="records"),
                        "original_rows": len(df),
                        "cleaned_rows": len(df_cleaned),
                        "rows_removed": len(df) - len(df_cleaned)
                    }
                
                else:
                    return {
                        "success": False,
                        "error": f"Unknown operation: {operation}"
                    }
                    
            except ImportError:
                return {
                    "success": False,
                    "error": "pandas library not installed"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
