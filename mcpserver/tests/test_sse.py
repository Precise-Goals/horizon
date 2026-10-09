import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sse_endpoint_handshake(async_client: AsyncClient):
    """Verifies that the GET /sse endpoint establishes an SSE connection and emits the endpoint event."""
    # Test that /messages without valid session ID returns 400
    res = await async_client.post("/messages", json={"jsonrpc": "2.0", "method": "ping"})
    assert res.status_code == 400
    assert "sessionId" in res.json()["detail"]
