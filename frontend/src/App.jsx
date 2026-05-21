import {Link} from 'react-router-dom';

export default function App()
{
	return (
		< div className="app-layout">
			<header className="topbar">
				<div className="brand-block">
					<h1 className="brand-title">
						Checkmate Club
					</h1>
					<p className="brand-subtitle">
						A quiet room for sharp games, stubborn defenses and elegant blunders.
					</p> 
				</div>
				<nav className="main-nav">
					<Link to="/login">
						Login
					</Link>
					<Link to="/register">
						Register
					</Link>
				</nav>
			</header>

			<main className="app-main">
				<div className="app-content">
					<section className="card">
						<h2>
							Test
						</h2>
						<p>
							Test for the first view of the app.
						</p>
					</section>
				</div>
			</main>

			<footer className="app-footer">
				<nav className="main-nav">
					<Link to="/privacy-policy">
						Privacy Policy
					</Link>
					<Link to="/terms-of-service">
						Terms of Service
					</Link>
				</nav>
			</footer>
		</div> 
	)
}