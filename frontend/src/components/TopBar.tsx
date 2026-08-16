import { Link } from 'react-router-dom';

interface TopBarProps {
  title?: string;
  backTo?: string;
}

export function TopBar({ title, backTo }: TopBarProps) {
  return (
    <header className="topbar">
      {backTo ? (
        <Link className="back-link" to={backTo} aria-label="Назад">
          ←
        </Link>
      ) : (
        <Link className="brand" to="/">
          Nordhaus
        </Link>
      )}
      {title ? <h1>{title}</h1> : <span />}
      <span className="topbar-spacer" />
    </header>
  );
}
