import { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import * as ReactRouter from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./Dashboard";
import { PreBuiltUIList, ComponentWrapper, SuperTokensConfig } from "./config";
import Home from "./Home";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import FocusMode from "./components/FocusMode";
import Settings from "./components/Settings";
import NotificationTest from "./components/NotificationTest";
import PriorityBoards from "./components/PriorityBoards";
import HabitTracker from "./components/HabitTracker";
import WeeklyView from "./components/WeeklyView";
import DailyView from "./components/DailyView";
import { notificationService } from "./services/notificationService";

function App() {
    // Initialize notification service when app starts
    useEffect(() => {
        // Initialize notification service
        console.log('Initializing notification service...');
    }, []);

    return (
        <SuperTokensWrapper config={SuperTokensConfig}>
            <ThemeProvider>
                <BrowserRouter>
                    <main className="App app-container">
                        <div className="fill" id="home-container">
                            <ComponentWrapper>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    {/* SuperTokens authentication routes */}
                                    {getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}

                                    {/* Protected routes - require authentication */}
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
                                                    <WeeklyView />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/priority"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <PriorityBoards />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/habits"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <HabitTracker />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/focus"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <FocusMode />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/settings"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <Settings />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />
                                    <Route
                                        path="/notification-test"
                                        element={
                                            <SessionAuth>
                                                <AppLayout>
                                                    <NotificationTest />
                                                </AppLayout>
                                            </SessionAuth>
                                        }
                                    />


                                </Routes>
                            </ComponentWrapper>
                        </div>
                    </main>
                </BrowserRouter>
            </ThemeProvider>
        </SuperTokensWrapper>
    );
}

export default App;
