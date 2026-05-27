import { Link } from "react-router-dom"

export default function Footer()
{
	return (
		<footer className="app-footer">
				<Link className="btn nav-btn" to="/privacy-policy">
					Privacy Policy
				</Link>
				<Link className="btn nav-btn" to="/terms-of-service">
					Terms
				</Link>
		</footer>
	);
}
