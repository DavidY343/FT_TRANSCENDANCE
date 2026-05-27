import { Link, useNavigate } from "react-router-dom"
import { clearTokens } from "../api";

function BrandBlock()
{
	return (
		<div className="brand-block">
			<h1 className="brand-title">
				Checkmate Club
			</h1>
			<p className="brand-subtitle">
				A quiet room for sharp games, stubborn defenses and elegant blunders.
			</p>
		</div>
	);
}

function TopNav(props)
{
	const navigate = useNavigate();

	function handleDevLogin()
	{
		localStorage.setItem('access_token', 'dev-token');
		navigate('/lobby');
	}

	function handleLogout()
	{
		clearTokens()
		navigate('/login');
	}

	if (props.authed)
	{
		return (
			<nav className="top-nav">
				<button className="btn nav-btn" onClick={handleLogout}>
					Logout
				</button>
			</nav>
		);
	}
	else
		return (
			<nav className="top-nav">
				{/* Temporary dev login: remove this block when no longer needed. */}
				{import.meta.env.DEV && (
					<button className="btn nav-btn" onClick={handleDevLogin}>
						Dev login
					</button>
				)}
				<Link className="btn nav-btn" to="/login">
					Login
				</Link>
				<Link className="btn nav-btn" to="/register">
					Register
				</Link>
			</nav>
		);
}

export default function TopBar(props)
{
	return (
		<header className="topbar">
			<BrandBlock/>
			<TopNav current={props.current} authed={props.authed}/>
		</header>
	);
}
