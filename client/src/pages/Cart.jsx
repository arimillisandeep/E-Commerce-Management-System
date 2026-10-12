import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ProductImage from '../components/ProductImage';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  // Always fetch fresh cart data when the page opens
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !cart) return <Loader text="Loading cart..." />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <h1>Shopping Cart</h1>
        <EmptyState message="Your cart is empty. Browse products to add items." />
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const handleQty = async (item, delta) => {
    setBusyId(item.cart_item_id);
    try {
      await updateItem(item.cart_item_id, item.quantity + delta);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    setBusyId(item.cart_item_id);
    try {
      await removeItem(item.cart_item_id);
      toast.success('Item removed.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.cart_item_id} className="cart-item">
              <Link to={`/products/${item.product_id}`} className="cart-item-image">
                <ProductImage src={item.image_url} alt={item.name} />
              </Link>

              <div className="cart-item-info">
                <Link to={`/products/${item.product_id}`}>
                  <h3>{item.name}</h3>
                </Link>
                <p className="cart-item-price">{formatPrice(item.price)} each</p>
                {item.quantity > item.stock && (
                  <p className="field-error">Only {item.stock} available</p>
                )}
              </div>

              <div className="cart-item-controls">
                <div className="qty-controls">
                  <button
                    onClick={() => handleQty(item, -1)}
                    disabled={busyId === item.cart_item_id}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleQty(item, 1)}
                    disabled={busyId === item.cart_item_id}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <p className="cart-item-total">
                  {formatPrice(item.price * item.quantity)}
                </p>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(item)}
                  disabled={busyId === item.cart_item_id}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({cart.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>
          <Link to="/products" className="back-link">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
