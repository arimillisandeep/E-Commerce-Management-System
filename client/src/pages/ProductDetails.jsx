import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProductImage from '../components/ProductImage';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data.product);
      setQty(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addItem(product.id, qty);
      toast.success(`${product.name} added to cart.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loader text="Loading product..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!product) return <ErrorMessage message="Product not found." />;

  return (
    <div className="page product-details">
      <Link to="/products" className="back-link">← Back to products</Link>

      <div className="product-detail-layout">
        <div className="product-detail-image">
          <ProductImage src={product.image_url} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category || 'General'}</span>
          <h1>{product.name}</h1>
          <p className="price-large">{formatPrice(product.price)}</p>
          <p className="product-description">{product.description}</p>
          <p className={`stock ${product.stock === 0 ? 'out' : ''}`}>
            {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
          </p>

          {product.stock > 0 && (
            <div className="add-to-cart-row">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) =>
                  setQty(Math.min(product.stock, Math.max(1, Number(e.target.value) || 1)))
                }
                className="qty-input"
              />
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={adding}
              >
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
