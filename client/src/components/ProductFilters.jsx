import { useState } from 'react';
import api from '../services/api';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductFilters({
  categories,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onPriceChange,
  resultCount,
}) {
  const [localSearch, setLocalSearch] = useState(search);
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  return (
    <aside className="filters">
      <div className="filter-group search-group">
        <input
          type="search"
          placeholder="Search by name..."
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            onSearchChange(e.target.value);
          }}
        />
      </div>

      <div className="filter-group">
        <label>Category</label>
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Sort by</label>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name (A-Z)</option>
          <option value="stock">Most Stock</option>
        </select>
      </div>

      <div className="filter-group price-range">
        <label>Price range</label>
        <div className="price-inputs">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={min}
            onChange={(e) => {
              setMin(e.target.value);
              onPriceChange(e.target.value, max);
            }}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={max}
            onChange={(e) => {
              setMax(e.target.value);
              onPriceChange(min, e.target.value);
            }}
          />
        </div>
      </div>

      <p className="result-count">{resultCount} product(s) found</p>
    </aside>
  );
}
