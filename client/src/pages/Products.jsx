import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import DataState from '../components/DataState';
import ProductFilters from '../components/ProductFilters';
import { useCart } from '../context/CartContext';
import { debounce, formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  // Read filter state from URL so searches are shareable
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {};
      if (search) query.search = search;
      if (category) query.category = category;
      if (sort) query.sort = sort;
      if (minPrice) query.minPrice = Number(minPrice);
      if (maxPrice) query.maxPrice = Number(maxPrice);
      query.page = page;
      query.limit = 9;

      const { data } = await api.get('/products', { params: query });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories')
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);

  const updateParams = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // reset to page 1 on filter change
    setParams(next);
  };

  const debouncedSearch = useCallback(
    debounce((value) => updateParams('search', value), 350),
    [params]
  );

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
      <h1>Products</h1>

      <ProductFilters
        categories={categories}
        search={search}
        onSearchChange={debouncedSearch}
        category={category}
        onCategoryChange={(v) => updateParams('category', v)}
        sort={sort}
        onSortChange={(v) => updateParams('sort', v)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={(min, max) => {
          updateParams('minPrice', min);
          updateParams('maxPrice', max);
        }}
        resultCount={pagination ? pagination.total : 0}
      />

      <DataState
        loading={loading}
        error={error}
        onRetry={fetchProducts}
        empty={products.length === 0}
        emptyMessage={
          search || category
            ? 'No products match your filters. Try clearing them.'
            : 'No products available yet.'
        }
      >
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={handleAdd} />
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-sm"
              disabled={page <= 1}
              onClick={() => updateParams('page', String(page - 1))}
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => updateParams('page', String(page + 1))}
            >
              Next
            </button>
          </div>
        )}
      </DataState>
    </div>
  );
}
