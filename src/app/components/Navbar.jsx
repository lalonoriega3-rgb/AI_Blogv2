// src/app/components/Navbar.jsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        AI<span>Hub</span>
      </Link>
      <ul className="navbar-links">
        <li>
          <Link href="/">Inicio</Link>
        </li>
        <li>
          <Link href="/blog">Artículos</Link>
        </li>
        <li>
          <Link href="/sobre">Acerca</Link>
        </li>
      </ul>
    </nav>
  );
}
