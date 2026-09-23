import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load from backend/.env or root .env
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")
load_dotenv()

class Settings(BaseModel):
    typesafe_api_key: str = os.getenv("TYPESAFE_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    llm_provider: str = os.getenv("LLM_PROVIDER", "auto") # 'auto', 'gemini', 'openai', 'zero_cost'
    use_vertex_oauth: bool = os.getenv("USE_VERTEX_OAUTH", "false").lower() == "true"
    gcp_project: str = os.getenv("GCP_PROJECT", "")
    gcp_location: str = os.getenv("GCP_LOCATION", "us-central1")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    jev_model: str = os.getenv("JEV_MODEL", "jev-latest")
    
    # Thresholds
    waffle_threshold: float = 1.2        # Out of 3.0
    circularity_threshold: float = 0.65  # Noul probability (0.0 to 1.0)
    decision_readiness_threshold: float = 1.5 # Out of 2.0
    
    # Default personality: 'ruthless' (Anti-Waffle Boss) or 'diplomatic' (Gentle Facilitator)
    personality: str = "ruthless"

settings = Settings()
