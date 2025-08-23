import React from 'react';
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import * as ReactRouter from "react-router-dom";
import { PreBuiltUIList } from "./config";

export function DebugRoutes() {
    const routes = getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList);
    
    console.log("SuperTokens Routes:", routes);
    
    return (
        <div>
            <h3>SuperTokens Routes Debug:</h3>
            <pre>{JSON.stringify(routes, null, 2)}</pre>
        </div>
    );
}
