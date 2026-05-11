import os
import jwt
import httpx
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
PILARGROUP_API_URL = os.getenv("PILARGROUP_API_URL", "http://localhost:8000/api")

class MockLoginRequest(BaseModel):
    username: str
    password: str

@router.post("/dev/login")
async def dev_login(body: MockLoginRequest):
    # Hanya aktif di local
    if os.getenv("APP_ENV", "production") == "production":
        raise HTTPException(status_code=404, detail="Not available")

    mock_username = os.getenv("DEV_MOCK_USERNAME", "")
    mock_password = os.getenv("DEV_MOCK_PASSWORD", "")

    print(f"[dev_login] input: {body.username} / {body.password}")
    print(f"[dev_login] env: {mock_username} / {mock_password}")

    if body.username != mock_username or body.password != mock_password:
        raise HTTPException(status_code=401, detail="Invalid mock credentials")

    # Ambil data user dari pilargroup lokal
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Login dulu ke pilargroup untuk dapat token asli
            res = await client.post(
                f"{PILARGROUP_API_URL}/auth/login",
                json={"username": body.username, "password": body.password},
                headers={"Accept": "application/json"}, 
            )
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Tidak bisa konek ke pilargroup lokal")

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="User tidak ditemukan di pilargroup")

    data = res.json()

    # Return token asli dari pilargroup + user data
    return {
        "access_token": data["token"],
        "user": data["user"],
    }