from fastapi import FastAPI
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from server.routes import interview, analytics, jobs, auth

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ✅ Log all registered routes on startup
    print("\n🔁 REGISTERED ROUTES:")
    for route in app.router.routes:
        methods = ", ".join(route.methods)
        print(f"{methods:12} {route.path}")
    yield
    # (Optional) Shutdown logic can go here if needed

app = FastAPI(lifespan=lifespan)

# ✅ Include route modules with prefixes
app.include_router(interview.router)
app.include_router(analytics.router)
app.include_router(jobs.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])  # ✅ centralized

