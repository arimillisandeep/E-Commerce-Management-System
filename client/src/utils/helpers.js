export const formatPrice = (n) =>
  `$${Number(n).toFixed(2)}`;

export const debounce = (fn, delay = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};
