import os
from dotenv import load_dotenv
from supertokens_python import init, InputAppInfo, SupertokensConfig

# Load environment variables from .env file
load_dotenv()
from supertokens_python.recipe import session
from supertokens_python.recipe import dashboard
from supertokens_python.recipe import userroles
from supertokens_python.recipe import emailpassword



def get_api_domain() -> str:
    api_port = os.getenv("API_PORT", "5000")
    api_url = f"http://localhost:{api_port}"
    return api_url

def get_website_domain() -> str:
    website_port = os.getenv("WEBSITE_PORT", "3001")
    website_url = f"http://localhost:{website_port}"
    return website_url

# For development, we'll use the hosted SuperTokens service
supertokens_config = SupertokensConfig(
    connection_uri="https://try.supertokens.com",
    api_key=""  # Optional for development
)

app_info = InputAppInfo(
    app_name="FocusBoard",
    api_domain=get_api_domain(),
    website_domain=get_website_domain(),
    api_base_path="/auth",
    website_base_path="/auth"
)

recipe_list = [
    session.init(),
    dashboard.init(),
    userroles.init(),
    emailpassword.init()
]

init(
    supertokens_config=supertokens_config,
    app_info=app_info,
    framework="fastapi",
    recipe_list=recipe_list,
    mode="asgi",
    telemetry=False
)