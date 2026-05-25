import { Link } from "react-router-dom"

export default function Footer()
{
	return (
		<footer className="app-footer">
			<Link to="/privacy-policy">
				Privacy Policy
			</Link>
			<Link to="/terms-of-service">
				Terms of Service
			</Link>
		</footer>
	);
}
