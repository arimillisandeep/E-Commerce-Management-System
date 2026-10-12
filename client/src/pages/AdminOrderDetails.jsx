import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/admin/orders/${id}`);
        setOrder(data.data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Loader text="Loading order..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="page">
      <Link to="/admin/orders" className="back-link">← Back to orders</Link>
      <h1>Order #{order.id}</h1>
      <p>
        <strong>Customer:</strong> {order.customer_name} ({order.customer_email})
      </p>
      <p>
        <strong>Status:</strong>{' '}
        <span className={`status-badge status-${order.status}`}>{order.status}</span>
      </p>
      <p><strong>Placed:</strong> {new Date(order.created_at).toLocaleString()}</p>
      {order.shipping_address && (
        <p><strong>Shipping to:</strong> {order.shipping_address}</p>
      )}

      <h2>Items</h2>
      <table className="admin-table">
        <thead>
          <tr><th>Product</th><th>Unit Price</th><th>Qty</th><th>Line Total</th></tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}>
              <td><Link to={`/products/${i.product_id}`}>{i.product_name}</Link></td>
              <td>${Number(i.unit_price).toFixed(2)}</td>
              <td>{i.quantity}</td>
              <td>${(Number(i.unit_price) * i.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total: ${Number(order.total_amount).toFixed(2)}</h3>
    </div>
  );
}
