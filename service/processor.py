import cv2
import numpy as np
import base64
import os
import requests
import io
from PIL import Image
import google.generativeai as genai

def process_panorama(base64_images, prompt):
    images = []
    for b64 in base64_images:
        if "," in b64:
            b64 = b64.split(",")[1]
        img_data = base64.b64decode(b64)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is not None:
            images.append(img)
    
    if len(images) < 2:
        raise Exception("At least 2 images required for stitching")

    stitcher = cv2.Stitcher_create()
    status, stitched = stitcher.stitch(images)
    
    if status != cv2.Stitcher_OK:
        print(f"Stitching failed ({status}), falling back to horizontal stack")
        # Ensure all images have the same height for stacking
        min_h = min(img.shape[0] for img in images)
        resized = [cv2.resize(img, (int(img.shape[1] * min_h / img.shape[0]), min_h)) for img in images]
        stitched = np.hstack(resized)

    h, w = stitched.shape[:2]
    canvas_w = w
    canvas_h = int(w / 2)
    
    canvas = np.zeros((canvas_h, canvas_w, 3), dtype=np.uint8)
    y_offset = (canvas_h - h) // 2
    canvas[y_offset:y_offset+h, 0:w] = stitched

    mask = np.ones((canvas_h, canvas_w), dtype=np.uint8) * 255
    mask[y_offset:y_offset+h, 0:w] = 0

    return inpaint_with_ai(canvas, mask, prompt)

def inpaint_with_ai(img_np, mask_np, prompt):
    stability_key = os.getenv("STABILITY_API_KEY")
    
    _, img_encoded = cv2.imencode(".png", img_np)
    _, mask_encoded = cv2.imencode(".png", mask_np)
    
    response = requests.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking",
        headers={
            "Accept": "application/json",
            "Authorization": f"Bearer {stability_key}"
        },
        files={
            "init_image": ("init.png", img_encoded.tobytes(), "image/png"),
            "mask_image": ("mask.png", mask_encoded.tobytes(), "image/png"),
        },
        data={
            "mask_source": "MASK_IMAGE_WHITE",
            "text_prompts[0][text]": f"{prompt}, seamless 360 panorama, high quality",
            "text_prompts[0][weight]": 1,
            "cfg_scale": 7,
            "samples": 1,
            "steps": 30,
        }
    )

    if response.status_code != 200:
        raise Exception(f"AI Inpainting failed: {response.text}")

    data = response.json()
    return data["artifacts"][0]["base64"]
