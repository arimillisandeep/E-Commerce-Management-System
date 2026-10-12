import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/products?search=${encodeURIComponent(search.trim())}` : '/products');
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          ShopZone
        </Link>

        <form className="navbar-search" onSubmit={handleSearch} role="search">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/products" onClick={() => setMenuOpen(false)}>Products</NavLink>
          {user ? (
            <>
              <NavLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</NavLink>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className="admin-link" onClick={() => setMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
              <NavLink to="/profile" className="nav-user" title="View my profile">
                Hi, {user.name.split(' ')[0]} ▾
              </NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Register
              </NavLink>
            </>
          )}
        </nav>

        {user && (
          <NavLink
            to="/cart"
            className="navbar-cart"
            onClick={() => setMenuOpen(false)}
            title="View cart"
          >
            Cart{itemCount > 0 && <span className="badge">{itemCount}</span>}
          </NavLink>
        )}
      </div>
    </header>
  );
}
