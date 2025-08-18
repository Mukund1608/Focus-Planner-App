import React, { useEffect } from "react";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import * as ReactRouter from "react-router-dom";
import Dashboard from "./Dashboard";
import { PreBuiltUIList, SuperTokensConfig, ComponentWrapper } from "./config";
import Home from "./Home";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import AppLayout from "./components/AppLayout";
import FocusMode from "./components/FocusMode";
import Settings from "./components/Settings";
import NotificationTest from "./components/NotificationTest";
import PriorityBoards from "./components/PriorityBoards";
import HabitTracker from "./components/HabitTracker";
import WeeklyView from "./components/WeeklyView";
import DailyView from "./components/DailyView";
import { notificationService } from "./services/notificationService";
import AccessibilityControls from "./components/AccessibilityControls";
import ReminderSettings from "./components/ReminderSettings";

// Initialize SuperTokens - guard against HMR double init
if (!(window as any).__stInit) {
	SuperTokens.init(SuperTokensConfig);
	(window as any).__stInit = true;
}

function SettingsPage() {
	return (
		<div className="placeholder-page" aria-labelledby="settings-title">
			<h1 id="settings-title">Settings</h1>
			<p>Manage your preferences and accessibility options.</p>
			<AccessibilityControls />
			<ReminderSettings />
		</div>
	);
}

function TopHeader() {
	const location = useLocation();
	if (location.pathname !== "/") return null;
	return (
		<header role="banner" aria-label="Application Header">
			<nav className="header-container" role="navigation" aria-label="Primary">
				<Link to="/" className="brand" aria-label="Go to Home">
					<img src="/assets/images/guide-icon.svg" alt="FocusBoard logo" />
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
	);
}

function App() {
	useEffect(() => {
		console.log('Initializing notification service...');
	}, []);

	return (
		<SuperTokensWrapper>
			<AccessibilityProvider>
				<ThemeProvider>
					<BrowserRouter>
						<main className="App app-container" role="main">
							<TopHeader />
							<div className="fill" id="home-container">
								<ComponentWrapper>
									<Routes>
										<Route path="/" element={<Home />} />
										{getSuperTokensRoutesForReactRouterDom(ReactRouter, PreBuiltUIList)}
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
														<SettingsPage />
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
								<img className="separator-line" src="/assets/images/separator-line.svg" alt="separator" />
							</div>
						</main>
					</BrowserRouter>
				</ThemeProvider>
			</AccessibilityProvider>
		</SuperTokensWrapper>
	);
}

export default App;
