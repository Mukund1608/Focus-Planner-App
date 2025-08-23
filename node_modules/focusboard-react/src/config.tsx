
"use client";

import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import Session from "supertokens-auth-react/recipe/session";


export function getApiDomain() {
    const apiPort = import.meta.env.VITE_API_PORT || 5000;
    const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:${apiPort}`;
    return apiUrl;
}

export function getWebsiteDomain() {
    const websitePort = import.meta.env.VITE_WEBSITE_PORT || 3001;
    const websiteUrl = import.meta.env.VITE_WEBSITE_URL || `http://localhost:${websitePort}`;
    return websiteUrl;
}



export const SuperTokensConfig = {
    appInfo: {
        appName: "FocusBoard",
        apiDomain: getApiDomain(),
        websiteDomain: getWebsiteDomain(),
        apiBasePath: "/auth",
        websiteBasePath: "/auth",
    },
    
    recipeList: [
        EmailPassword.init({
            signInAndUpFeature: {
                // defaultToSignUp is not a valid property in this version
            },
        }),
        Session.init()
    ],
    getRedirectionURL: async (context: any) => {
        console.log("Redirection context:", context);
        if (context.action === "SUCCESS") {
            return "/dashboard";
        }
        return undefined;
    },
};

export const recipeDetails = {
    docsLink: "https://supertokens.com/docs/quickstart/introduction",
};

export const PreBuiltUIList = [EmailPasswordPreBuiltUI];



export const ComponentWrapper = (props: { children: JSX.Element }): JSX.Element => {
    let childrenToRender = props.children;

    
    return childrenToRender;
}