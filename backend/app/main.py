from fastapi import FastAPI
from .auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议指定前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"msg": "RWA 学习平台后端已启动"}
