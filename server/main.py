import os
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from server.routes import interview, analytics, jobs, auth, dashboard
from server.routes.suggestions import router as suggestionsRouter
from fastapi.routing import APIRoute

load_dotenv()

frontend_path = os.path.join(os.path.dirname(__file__), "../client/dist")

@asynccontextmanager
async def lifespan(application: FastAPI):
    print("\n🔁 REGISTERED ROUTES:")
    for route in application.router.routes:
        if isinstance(route, APIRoute):
            methods = ", ".join(route.methods)
            print(f"{methods:12} {route.path}")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pydatapro-fe.onrender.com",
        "http://localhost:5173",
        "https://www.pydatapro.com",
        "https://pydatapro.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return JSONResponse(content={"message": "PyDataPRO API is running!"})

app.include_router(suggestionsRouter, prefix="/api", tags=["Career Suggestions"])
app.include_router(interview.router)
app.include_router(analytics.router)
app.include_router(jobs.router)
app.include_router(dashboard.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return JSONResponse(content={"detail": "Frontend not found"}, status_code=404)
