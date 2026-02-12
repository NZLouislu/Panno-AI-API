from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import os
from service.processor import process_panorama

app = FastAPI()

class PannoRequest(BaseModel):
    prompt: str
    images: list[str]
    style: str = "photographic"

@app.get("/")
async def root():
    return {"status": "online", "engine": "Panno-AI-API"}

@app.post("/v1/generate")
async def generate(request: PannoRequest, x_api_key: str = Header(None)):
    if x_api_key != os.getenv("AUTH_TOKEN"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        result_base64 = process_panorama(request.images, request.prompt)
        return {
            "success": True, 
            "image": f"data:image/webp;base64,{result_base64}",
            "method": "cv_ai_hybrid"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
