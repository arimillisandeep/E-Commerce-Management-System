import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import DataState from '../components/DataState';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get('page') || '1', 10);
  const statusFilter = params.get('status') || '';
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = { page, limit: 10 };
      if (statusFilter) query.status = statusFilter;
      const { data } = await api.get('/admin/orders', { params: query });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (order, newStatus) => {
    setUpdatingId(order.id);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus });
      toast.success(`Order #${order.id} → ${newStatus}`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            if (e.target.value) next.set('status', e.target.value);
            else next.delete('status');
            next.delete('page');
            setParams(next);
          }}
          className="status-filter"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataState loading={loading} error={error} onRetry={load}
        empty={orders.length === 0} emptyMessage="No orders found.">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Date</th>
                <th>Total</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/admin/orders/${o.id}`}>#{o.id}</Link>
                  </td>
                  <td>
                    {o.customer_name}
                    <small className="muted">{o.customer_email}</small>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{formatPrice(o.total_amount)}</td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>{o.status}</span>
                  </td>
                  <td className="table-actions">
                    <select
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatus(o, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setParams({ ...Object.fromEntries(params), page: String(page - 1) })}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            className="btn btn-outline btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setParams({ ...Object.fromEntries(params), page: String(page + 1) })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
