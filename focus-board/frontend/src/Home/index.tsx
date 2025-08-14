import { Link } from "react-router-dom";
import { useSessionContext } from "supertokens-auth-react/recipe/session";

export default function Home() {
    const session = useSessionContext();

    if (session.loading) {
        return null;
    }

    return (
        <>
            <section className="main-container" id="focusboard-home">
                <div className="inner-content">
                    <h1>
                        <strong>FocusBoard</strong>
                    </h1>
                    <div>
                        {session.doesSessionExist ? (
                            <p>
                                Welcome back. Jump into your work and stay focused.
                            </p>
                        ) : (
                            <p>Prioritize. Focus. Execute.</p>
                        )}
                    </div>
                    <nav className="buttons">
                        {session.doesSessionExist ? (
                            <Link to="/dashboard" className="dashboard-button">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <Link to="/auth" className="dashboard-button">
                                Sign in / Create account
                            </Link>
                        )}
                    </nav>
                </div>
            </section>
        </>
    );
}
