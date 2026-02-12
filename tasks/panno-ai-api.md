# Panno-AI-API 项目详细设计与实施指南

## 1. 项目背景与需求分析
### 1.1 核心痛点
- **环境限制**：Vercel 等 Serverless 平台不支持 OpenCV (C++) 底层编译库，无法进行物理图像拼接。
- **性能瓶颈**：全景图拼接属于 CPU/内存密集型任务，Serverless 函数容易超时且资源受限。
- **模型依赖**：未来的拼接算法可能需要深度学习模型（如深度估算），需要一个真正的服务器环境。

### 1.2 项目目标
构建一个专门运行在 Hugging Face Spaces 上的 Python 运算引擎，为前端提供高精度的全景图生成服务。

---

## 2. 核心功能规范
### 2.1 智能拼接管道 (CV Pipeline)
- **输入检测**：自动识别上传图片的重叠区域。
- **Stitching 算法**：利用 OpenCV 的 `Stitcher` 类（基于 SIFT/SURF 特征点）进行特征匹配。
- **几何校正**：将拼接后的图像投影为 2:1 的等距柱状全景视图。

### 2.2 AI 智能缝隙补全 (AI Inpainting)
- **掩码生成**：自动识别拼接后留下的黑边（通常是天花板和地面）。
- **生成式扩展**：调用 Stability AI SDK，利用图像上下文和用户提示词（Prompt）进行“无缝补全”。

### 2.3 视觉特征分析
- 利用 Gemini 2.0 Flash 视觉能力分析参考图，确保补全的纹理（如木地板、石膏顶）与原图 100% 匹配。

---

## 3. 接口设计 (API Specification)

### 接口 URL: `POST /v1/generate`

#### 3.1 请求头 (Headers)
| Key | Value | 说明 |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | |
| `X-API-Key` | `PROD_SECRET_PASSWORD` | 用于 Vercel 与 HF 之间的身份校验 |

#### 3.2 请求体 (Request Body)
```json
{
  "prompt": "现代简约风格客厅，阳光充足",
  "style": "photographic",
  "images": [
    "data:image/png;base64,iVBORw0K...", // 原始参考图1
    "data:image/png;base64,iVBORw0K..."  // 原始参考图2
  ]
}
```

#### 3.3 返回体 (Response Body)
```json
{
  "success": true,
  "image": "data:image/webp;base64,UklGRk...", // 最终全景图
  "method": "cv_ai_hybrid",                  // 处理方法
  "details": {
    "num_stitched": 5,
    "has_inpainting": true
  }
}
```

---

## 4. 核心实现代码预览

### 4.1 FastAPI 主入口 (`main.py`)
```python
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import base64
import os
from service.processor import process_panorama # 封装拼接逻辑

app = FastAPI()

class PannoRequest(BaseModel):
    prompt: str
    images: list[str]
    style: str = "photographic"

@app.post("/v1/generate")
async def generate(request: PannoRequest, x_api_key: str = Header(None)):
    # 1. 简易安全校验
    if x_api_key != os.getenv("AUTH_TOKEN"):
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        # 2. 调用处理函数
        result_base64 = process_panorama(request.images, request.prompt)
        return {
            "success": True, 
            "image": f"data:image/webp;base64,{result_base64}",
            "method": "cv_ai_hybrid"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
```

---

## 5. Hugging Face 部署关键配置

### 5.1 `packages.txt` (系统依赖)
HF 的 Docker 基础镜像通过此文件安装系统库。
```text
libgl1-mesa-glx
libglib2.0-ext
git
python3-opencv
```

### 5.2 `requirements.txt` (Python 依赖)
```text
fastapi
uvicorn
opencv-python-headless
numpy
requests
google-generativeai
python-multipart
```

---

## 6. 与前端 Next.js 的配合流程

### 6.1 通信链路
1.  **用户操作**：在前端页面上传 5 张照片，点击“生成”。
2.  **Next.js 接收**：Next.js 后端路由 `api/generate` 接收到 Base64 图片。
3.  **分发请求**：Next.js 通过 `fetch` 将数据转发给 Hugging Face 上的 Panno-AI-API。
4.  **后端运算**：HF 上的 Python 引擎进行拼接和 AI 扩图，返回最终大图。
5.  **前端展示**：Next.js 将结果直接传回浏览器预览，并保存至用户的 LocalStorage 或数据库。

### 6.2 环境变量同步
- **Vercel 后台配置**:
  - `REMOTE_WORKER_URL`: 指向 HF Space 的地址。
  - `REMOTE_WORKER_KEY`: 与 HF 上的 `AUTH_TOKEN` 保持一致。
  
- **Hugging Face 后台配置**:
  - `AUTH_TOKEN`: 自定义强密码。
  - `STABILITY_API_KEY`: AI 补全密钥。
  - `GEMINI_API_KEY`: 视觉分析密钥。

---

## 7. 下一步行动 (Action Plan)
1.  **初始化仓库**：在 `Panno-AI-API` 目录下创建上述文件。
2.  **本地测试**：在本地使用 `uvicorn main:app --reload` 运行 API。
3.  **HF 部署**：推送代码到 GitHub 关联 HF Space 自动构建。
4.  **联调**：在本地 Next.js 中填入 HF 的测试参数进行端到端测试。
