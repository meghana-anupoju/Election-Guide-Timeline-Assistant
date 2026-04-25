from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .api.routes import router

app = FastAPI(
    title="Election Guide API",
    description="Backend API for the Election Guide & Timeline Assistant",
    version="1.0.0",
)

# Allow requests from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/api")
def root():
    return {
        "message": "Election Guide & Timeline Assistant API",
        "docs": "/docs",
        "version": "1.0.0",
    }

# Serve React frontend in production
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")

if os.path.exists(STATIC_DIR):
    # Mount everything else under /
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

    # Catch-all route for React client-side routing
    @app.exception_handler(404)
    async def custom_404_handler(request, __):
        # Only rewrite to index.html if it's not an API call
        if not request.url.path.startswith("/api/"):
            index_path = os.path.join(STATIC_DIR, "index.html")
            if os.path.exists(index_path):
                return FileResponse(index_path)
        return {"detail": "Not Found"}

