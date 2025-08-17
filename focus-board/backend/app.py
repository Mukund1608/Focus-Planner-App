import uvicorn

from fastapi import FastAPI, Depends
from starlette.middleware.cors import CORSMiddleware

from supertokens_python import init, get_all_cors_headers
from supertokens_python.framework.fastapi import get_middleware
from supertokens_python.recipe.session import SessionContainer
from supertokens_python.recipe.session.framework.fastapi import verify_session
from supertokens_python.recipe.multitenancy.asyncio import list_all_tenants
from supertokens_python.recipe.emailpassword.asyncio import get_user_by_id

import config
from database import create_tables
from api import router as tasks_router

# SuperTokens init should happen in config.py

app = FastAPI(
    title="FocusBoard API",
    description="API for FocusBoard - Priority Task Management",
    version="1.0.0",
    # Disable automatic trailing slash redirection
    redirect_slashes=False
)

app.add_middleware(get_middleware())

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
        user = await get_user_by_id(user_id)
        
        if user:
            return {
                "id": user.user_id,
                "email": user.email,
                "timeJoined": user.time_joined
            }
        else:
            return {"error": "User not found"}
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", config.app_info.website_domain],
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"] + get_all_cors_headers(),
)

# Add error handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return {"error": str(exc), "detail": "Internal server error"}

if __name__  == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
