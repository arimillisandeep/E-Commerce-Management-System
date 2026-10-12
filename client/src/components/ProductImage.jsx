import { useState } from 'react';

// Image with graceful fallback: if the image URL fails to load
// (e.g. offline network, blocked host), shows a placeholder box
// instead of a broken-image icon / blank area.
export default function ProductImage({ src, alt = 'Product image' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="product-image-placeholder">{alt}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
