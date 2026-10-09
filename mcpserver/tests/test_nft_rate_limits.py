import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.tools.registry import execute_tool


@pytest.mark.asyncio
async def test_get_nft_rate_limits_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/nft/rate-limits")
        assert res.status_code == 200
        data = res.json()

        assert data["status"] == "success"
        assert data["design_theme"]["hex"] == "#0047AB"
        assert data["canonical_image_url"] == "https://horizon-aiops.vercel.app/horizon.jpg"

        limits = data["rate_limits"]
        assert limits["explorer"]["autologging_rate_limit"] == 5
        assert limits["guardian"]["autologging_rate_limit"] == 10
        assert limits["sentinel"]["autologging_rate_limit"] == 15
        assert limits["enterprise"]["autologging_rate_limit"] == 20


@pytest.mark.asyncio
async def test_get_nft_tier_metadata_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/nft/metadata/explorer")
        assert res.status_code == 200
        data = res.json()

        assert "Explorer" in data["name"]
        assert data["image"] == "https://horizon-aiops.vercel.app/horizon.jpg"
        assert data["theme_color"] == "#0047AB"
        assert data["background_color"] == "0047AB"

        attrs = {a["trait_type"]: a["value"] for a in data["attributes"]}
        assert attrs["AutoLogging Rate Limit"] == 5
        assert attrs["Theme Hex"] == "#0047AB"


@pytest.mark.asyncio
async def test_mcp_tool_horizon_get_nft_rate_limits():
    result = await execute_tool("horizon_get_nft_rate_limits", {"tier": "all"})
    assert result.isError is False
    assert len(result.content) > 0
    text = result.content[0].text
    assert "#0047AB" in text
    assert "https://horizon-aiops.vercel.app/horizon.jpg" in text
    assert '"autologging_rate_limit": 5' in text
    assert '"autologging_rate_limit": 10' in text
    assert '"autologging_rate_limit": 15' in text
    assert '"autologging_rate_limit": 20' in text
