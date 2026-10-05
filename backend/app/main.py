from fastapi import FastAPI

from .database import Base, engine
from . import models
from .routes.auth_routes import router as auth_router
from .routes.llm_routes import router as llm_router
from .routes.evaluation_routes import router as evaluation_router
from fastapi.middleware.cors import CORSMiddleware
from .routes.dataset_routes import router as dataset_router
from app.routes.dashboard_routes import router as dashboard_router
from .routes.model_routes import router as model_router



Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="LLM Evaluation Platform",
    description="LLM Evaluation and Hallucination Detection Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://llm-evaluation-platform-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)






app.include_router(auth_router)
app.include_router(llm_router)
app.include_router(evaluation_router)
app.include_router(dataset_router)
app.include_router(dashboard_router)
app.include_router(model_router)



@app.get("/")
def root():
    return {
        "message": "LLM Evaluation Platform API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-test")
def database_test():
    return {
        "message": "Database connected successfully"
    }