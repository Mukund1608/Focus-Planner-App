import uvicorn
import os
from dotenv import load_dotenv

from fastapi import FastAPI, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Load environment variables
load_dotenv()

# Import SuperTokens config first to ensure initialization
import config

from supertokens_python import get_all_cors_headers
from supertokens_python.framework.fastapi import get_middleware
from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.multitenancy.asyncio import list_all_tenants
from supertokens_python.recipe.usermetadata.asyncio import get_user_metadata

from database import create_tables
from api import router as tasks_router

app = FastAPI(
    title="FocusBoard API",
    description="API for FocusBoard - Priority Task Management",
    version="1.0.0",
    # Disable automatic trailing slash redirection
    redirect_slashes=False
)

# Add CORS middleware first (before SuperTokens and routes)
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "rid", "fdi-version", "X-Requested-With", "anti-csrf", "st-auth-mode"] + get_all_cors_headers(),
    expose_headers=["*"],
    max_age=600,
)

# Add SuperTokens middleware
app.add_middleware(get_middleware())

# Add custom CORS enforcement middleware after SuperTokens
class CORSEnforcementMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Ensure CORS headers are always present
        origin = request.headers.get("origin")
        if origin and origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

app.add_middleware(CORSEnforcementMiddleware)

# Include the tasks API router
app.include_router(tasks_router)

@app.get("/")
async def root():
    return {"message": "FocusBoard API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}

async def get_session_info(s: SessionContainer = Depends(verify_session())):
    return {
        "sessionHandle": s.get_handle(),
        "userId": s.get_user_id(),
        "accessTokenPayload": s.get_access_token_payload(),
    }

# Add routes for both with and without trailing slash
app.get("/sessioninfo")(get_session_info)
app.get("/sessioninfo/")(get_session_info)

@app.get("/api/user/profile")
async def get_user_profile(s: SessionContainer = Depends(verify_session())):
    try:
        user_id = s.get_user_id()
        # Get user metadata instead of full user object
        user_metadata = await get_user_metadata(user_id)
        
        return {
            "id": user_id,
            "metadata": user_metadata.metadata if user_metadata else {}
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/tenants")
@app.get("/tenants/")
async def get_tenants():
    tenantReponse = await list_all_tenants()

    tenantsList = []

    for tenant in tenantReponse.tenants:
        tenantsList.append(tenant.to_json())

    return {
        "status": "OK",
        "tenants": tenantsList,
    }

# Initialize database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()



# Add error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc):
    # Ensure CORS headers are present even for errors
    origin = request.headers.get("origin")
    response_data = {"error": str(exc), "detail": "Internal server error"}
    
    if origin and origin in allowed_origins:
        from fastapi.responses import JSONResponse
        response = JSONResponse(content=response_data)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    return response_data

if __name__  == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
