import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <Loader text="Loading order..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!order) return <ErrorMessage message="Order not found." />;

  return (
    <div className="page">
      <Link to="/orders" className="back-link">← Back to orders</Link>
      <h1>Order #{order.id}</h1>

      <div className="order-detail-layout">
        <div className="order-items">
          <h2>Items</h2>
          {order.items.map((item) => (
            <div key={item.id} className="order-item">
              <Link to={`/products/${item.product_id}`}>{item.product_name}</Link>
              <span>
                {item.quantity} × {formatPrice(item.unit_price)} ={' '}
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Status</span>
            <span className={`status-badge status-${order.status}`}>{order.status}</span>
          </div>
          <div className="summary-row">
            <span>Placed on</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>
          {order.shipping_address && (
            <div className="summary-row">
              <span>Shipping to</span>
              <span>{order.shipping_address}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
