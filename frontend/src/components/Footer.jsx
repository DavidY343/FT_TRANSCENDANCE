import { Link } from "react-router-dom"

export default function Footer()
{
	return (
		<footer className="app-footer">
			<button className=" btn nav-btn">
				<Link to="/privacy-policy">
					Privacy Policy
				</Link>
			</button>
			<button className="btn nav-btn">
				<Link to="/terms-of-service">
					Terms
				</Link>
			</button>
		</footer>
	);
}
