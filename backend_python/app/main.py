import os

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import create_tables
from .routers import blog_posts, comments, users
from .websocket import websocket_endpoint

load_dotenv()

app = FastAPI(title="Blog API", description="Simple FastAPI + PostgreSQL blog API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(blog_posts.router)
app.include_router(comments.router)


# Special route for blog post comments (to match Node.js API)
@app.get("/api/blog_posts/{blog_post_id}/comments")
async def get_blog_post_comments_endpoint(blog_post_id: int):
    from .database import get_db
    from .routers.comments import get_blog_post_comments

    db = next(get_db())
    try:
        return get_blog_post_comments(blog_post_id, db)
    finally:
        db.close()


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_route(websocket: WebSocket):
    await websocket_endpoint(websocket)


# Serve static files from frontend build (if exists)
frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend-build")
if os.path.exists(frontend_build_path):
    app.mount("/static", StaticFiles(directory=frontend_build_path), name="static")

    # Serve React app for all non-API routes
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("ws"):
            return {"error": "Not found"}

        index_file = os.path.join(frontend_build_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend not built"}


@app.on_event("startup")
async def startup_event():
    create_tables()
    print("Database tables created/verified")


@app.get("/")
async def root():
    return {"message": "Blog API is running", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
