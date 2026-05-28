import { Link } from "react-router-dom"

export default function Footer()
{
	return (
		<footer className="app-footer">
				<Link className="footer-link" to="/privacy-policy">
					Privacy Policy
				</Link>
				<Link className="footer-link" to="/terms-of-service">
					Terms
				</Link>
		</footer>
	);
}
