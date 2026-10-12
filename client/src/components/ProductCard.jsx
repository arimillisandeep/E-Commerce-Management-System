import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import ProductImage from './ProductImage';

export default function ProductCard({ product, onAdd }) {
  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-image">
        <ProductImage src={product.image_url} alt={product.name} />
      </div>
      <div className="product-info">
        <span className="product-category">{product.category || 'General'}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <span className={`stock ${product.stock === 0 ? 'out' : ''}`}>
            {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
          </span>
        </div>
        {onAdd && product.stock > 0 && (
          <button
            className="btn btn-primary btn-sm btn-block"
            onClick={(e) => {
              e.preventDefault();
              onAdd(product);
            }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
