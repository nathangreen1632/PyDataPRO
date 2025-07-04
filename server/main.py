from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from server.routes import interview, analytics, jobs, auth, dashboard
from server.routes.suggestions import router as suggestionsRouter
from server.routes import learning_resources

load_dotenv()

@asynccontextmanager
async def lifespan(application: FastAPI):
    print("\n🔁 REGISTERED ROUTES:")
    for route in application.router.routes:
        methods = ", ".join(route.methods)
        print(f"{methods:12} {route.path}")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pydatapro-fe.onrender.com",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://www.pydatapro.com",
        "https://pydatapro.com",
        "https://careergistpro.com",
        "https://www.careergistpro.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return JSONResponse(content={"message": "PyDataPRO API is running!"})

app.include_router(suggestionsRouter, prefix="/api", tags=["Career Suggestions"])
app.include_router(interview.router, prefix="/api", tags=["Interview"])
app.include_router(analytics.router, prefix="/api/analytics")
app.include_router(jobs.router, prefix="/api", tags=["Jobs"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(learning_resources.router, prefix="/api", tags=["Learning Resources"])