import { Link, Navigate } from "react-router-dom"

function BrandBlock()
{
	return (
		<div className="brand-block">
			<h1 className="brand-title">
				Chessmate Club
			</h1>
			<p className="brand-subtitle">
				A quiet room for sharp games, stubborn defenses and elegant blunders.
			</p>
		</div>
	);
}

function MainNav()
{
	return (
		<nav className="main-nav">
			<Link to="/login">
				Login
			</Link>
			<Link to="/register">
				Register
			</Link>
		</nav>
	);
}

export default function TopBar()
{
	return (
		<header className="topbar">
			<BrandBlock/>
			<MainNav/>
		</header>
	);
}