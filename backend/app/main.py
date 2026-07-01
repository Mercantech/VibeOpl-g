from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import time

from app.config import settings
from app.database import Base, engine
from app.routers import auth, comments, config, projects, uploads
from app.storage import init_storage


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    for attempt in range(15):
        try:
            init_storage()
            break
        except Exception:
            if attempt == 14:
                raise
            time.sleep(2)
    yield


app = FastAPI(title="VibeOpl-g API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(config.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(comments.router)
app.include_router(uploads.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
