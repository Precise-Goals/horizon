"""
Horizon MCP Server — Root Entrypoint Proxy.
Enables execution when Render Web Service is started from the repository root directory.
"""
import os
import sys
from pathlib import Path

# Add mcpserver directory to sys.path
mcpserver_dir = Path(__file__).resolve().parent / "mcpserver"
if str(mcpserver_dir) not in sys.path:
    sys.path.insert(0, str(mcpserver_dir))

from app.main import app  # noqa: E402, F401

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "10000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, workers=1)
