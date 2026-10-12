import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.total_revenue), to: '/admin/orders' },
    { label: 'Orders', value: stats.total_orders, to: '/admin/orders' },
    { label: 'Pending Orders', value: stats.pending_orders, to: '/admin/orders?status=pending' },
    { label: 'Products', value: stats.total_products, to: '/admin/products' },
    { label: 'Customers', value: stats.total_customers, to: '/admin/users' },
  ];

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        {cards.map((c) => (
          <Link to={c.to} key={c.label} className="stat-card">
            <span className="stat-value">{c.value}</span>
            <span className="stat-label">{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-quick-links">
        <Link to="/admin/products" className="btn btn-outline">Manage Products</Link>
        <Link to="/admin/orders" className="btn btn-outline">Manage Orders</Link>
        <Link to="/admin/users" className="btn btn-outline">View Users</Link>
      </div>
    </div>
  );
}
