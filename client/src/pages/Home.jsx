import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import DataState from '../components/DataState';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', {
        params: { limit: 8, sort: 'newest' },
      });
      setProducts(data.data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (product) => {
    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} added to cart.`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Welcome to ShopZone</h1>
        <p>Quality products, great prices, fast delivery.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </section>

      <section>
        <h2>Featured Products</h2>
        <DataState loading={loading} error={error} onRetry={load}
          empty={products.length === 0} emptyMessage="No products available yet.">
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        </DataState>
      </section>
    </div>
  );
}
