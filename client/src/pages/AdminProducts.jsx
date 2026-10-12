import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import DataState from '../components/DataState';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', price: '', stock: '', category: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // product being edited
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: list }, { data: cats }] = await Promise.all([
        api.get('/products', { params: { limit: 100 } }),
        api.get('/products/categories'),
      ]);
      setProducts(list.data.products);
      setCategories(cats.data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      category: p.category || '',
      image_url: p.image_url || '',
    });
    setErrors({});
    setEditing(p.id);
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
      e.price = 'Enter a valid non-negative price.';
    if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Enter a valid non-negative integer stock.';
    if (form.image_url && !/^https?:\/\//.test(form.image_url))
      e.image_url = 'Image URL must start with http(s)://';
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        image_url: form.image_url,
      };
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success('Product updated.');
      } else {
        await api.post('/products', payload);
        toast.success('Product created.');
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted.');
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Manage Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSave}>
          <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
          {errors.general && <div className="alert alert-error">{errors.general}</div>}

          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          {errors.name && <span className="field-error">{errors.name}</span>}

          <label>
            Description
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <div className="form-row">
            <label>
              Price
              <input
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            {errors.price && <span className="field-error">{errors.price}</span>}

            <label>
              Stock
              <input
                type="number" min="0" step="1"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </label>
            {errors.stock && <span className="field-error">{errors.stock}</span>}
          </div>

          <label>
            Category
            <input
              list="category-options"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Electronics"
            />
            <datalist id="category-options">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>

          <label>
            Image URL
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </label>
          {errors.image_url && <span className="field-error">{errors.image_url}</span>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataState loading={loading} error={error} onRetry={load}
        empty={products.length === 0} emptyMessage="No products yet. Create one!">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Category</th>
                <th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.category || '—'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td className={p.stock === 0 ? 'out' : ''}>{p.stock}</td>
                  <td className="table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button
                      className="btn btn-outline btn-sm danger"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </div>
  );
}
