import { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import * as ReactRouter from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./Dashboard";
import { PreBuiltUIList, ComponentWrapper } from "./config";
import Home from "./Home";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import { notificationService } from "./services/notificationService";

function App() {
    // Initialize notification service when app starts
    useEffect(() => {
        // Initialize notification service
        console.log('Initializing notification service...');
    }, []);

    return (
        <SuperTokensWrapper>
            <ThemeProvider>
                <BrowserRouter>
                    <main className="App app-container">
                        <header>
                            <nav className="header-container">
                                <Link to="/" className="brand">
                                    <img src="/assets/images/guide-icon.svg" alt="FocusBoard" />
                                    <span>FocusBoard</span>
                                </Link>
                                <ul className="header-container-right">
                                    <li>
                                        <Link to="/">Home</Link>
                                    </li>
                                    <li>
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li>
                                        <Link to="/auth">Login</Link>
                                    </li>
                                </ul>
                            </nav>
                        </header>
                        <div className="fill" id="home-container">
                            <ComponentWrapper>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    {/* This shows the login UI on "/auth" route */}
                                    {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}

                                    {/* Protected routes with AppLayout */}
                                    <Route
                                        path="/dashboard"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <Dashboard />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/weekly"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <div className="placeholder-page">
                                                        <h1>Weekly View</h1>
                                                        <p>Weekly planning and overview will be implemented here.</p>
                                                    </div>
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/settings"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <div className="placeholder-page">
                                                        <h1>Settings</h1>
                                                        <p>User preferences and app settings will be configured here.</p>
                                                    </div>
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                </Routes>
                            </ComponentWrapper>
                            <img className="separator-line" src="/assets/images/separator-line.svg" alt="separator" />
                        </div>
                    </main>
                </BrowserRouter>
            </ThemeProvider>
        </SuperTokensWrapper>
    );
}

export default App;
