import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DataState from '../components/DataState';
import { formatPrice } from '../utils/helpers';

const statusClass = (s) => `status-badge status-${s}`;

export default function MyOrders() {
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get('page') || '1', 10);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/orders', {
        params: { page, limit: 8 },
      });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="page">
      <h1>My Orders</h1>
      <DataState loading={loading} error={error} onRetry={load}
        empty={orders.length === 0 && !loading}
        emptyMessage="You have not placed any orders yet.">
        <div className="order-list">
          {orders.map((o) => (
            <Link to={`/orders/${o.id}`} key={o.id} className="order-card">
              <div>
                <strong>Order #{o.id}</strong>
                <span className="order-date">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="order-card-right">
                <strong>{formatPrice(o.total_amount)}</strong>
                <span className={statusClass(o.status)}>{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Start Shopping
        </Link>
      </DataState>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setParams({ page: String(page - 1) })}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setParams({ page: String(page + 1) })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
