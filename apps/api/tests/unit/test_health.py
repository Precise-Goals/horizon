from fastapi.testclient import TestClient
from src.api.v1.endpoints.health import router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router, prefix="/health")

client = TestClient(app)

def test_health_check():
    response = client.get("/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["version"] == "1.0.0"
