from supertokens_python import init, InputAppInfo, SupertokensConfig
from supertokens_python.recipe import session
from supertokens_python.recipe import dashboard
from supertokens_python.recipe import userroles
from supertokens_python.recipe import emailpassword



def get_api_domain() -> str:
    api_port = str(3001)
    api_url = f"http://localhost:{api_port}"
    return api_url

def get_website_domain() -> str:
    website_port = str(3000)
    website_url = f"http://localhost:{website_port}"
    return website_url

supertokens_config = SupertokensConfig(
    connection_uri="https://try.supertokens.com"
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