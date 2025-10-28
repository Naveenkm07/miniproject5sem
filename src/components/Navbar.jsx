import ThemeSwitcher from './ThemeSwitcher';

const Navbar = ({ currentPage, onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1>📱 Memoria Vault</h1>
        </div>
        <div className="navbar-nav">
          <button
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${currentPage === 'gallery' ? 'active' : ''}`}
            onClick={() => onNavigate('gallery')}
          >
            Gallery
          </button>
          <button
            className={`nav-btn ${currentPage === 'albums' ? 'active' : ''}`}
            onClick={() => onNavigate('albums')}
          >
            Albums
          </button>
          <button
            className={`nav-btn ${currentPage === 'timeline' ? 'active' : ''}`}
            onClick={() => onNavigate('timeline')}
          >
            Timeline
          </button>
          <button
            className={`nav-btn ${currentPage === 'stats' ? 'active' : ''}`}
            onClick={() => onNavigate('stats')}
          >
            Statistics
          </button>
          <button
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            Settings
          </button>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
