import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  if (!cart) return <Loader text="Loading checkout..." />;
  if (cart.items.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <EmptyState message="Your cart is empty." />
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a shipping address.');
      return;
    }
    setPlacing(true);
    setError(null);
    try {
      const { data } = await api.post('/orders', {
        shipping_address: address.trim(),
      });
      await fetchCart(); // cart is now empty
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.data.order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping Address</h2>
          <label>
            Full address
            <textarea
              rows="4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, state, zip code"
            />
          </label>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={placing}>
            {placing ? 'Placing order...' : `Place Order — ${formatPrice(cart.subtotal)}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          {cart.items.map((item) => (
            <div key={item.cart_item_id} className="checkout-item">
              <span>
                {item.name} <small>× {item.quantity}</small>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
