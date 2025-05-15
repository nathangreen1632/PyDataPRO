from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from server.routes import interview, analytics, jobs, auth, dashboard

load_dotenv()

@asynccontextmanager
async def lifespan(application: FastAPI):
    print("\n🔁 REGISTERED ROUTES:")
    for route in application.router.routes:
        methods = ", ".join(route.methods)
        print(f"{methods:12} {route.path}")
    yield

app = FastAPI(lifespan=lifespan)

# ✅ CORS middleware to allow frontend -> backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pydatapro-fe.onrender.com", "http://localhost:5173", 'www.pydatapro.com', 'pydatapro.com'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return JSONResponse(content={"message": "PyDataPRO API is running!"})

# ✅ Route includes
app.include_router(interview.router)
app.include_router(analytics.router)
app.include_router(jobs.router)
app.include_router(dashboard.router, prefix="/api")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
