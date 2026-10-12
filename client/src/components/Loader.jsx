export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="state-container">
      <div className="spinner" aria-label="Loading" />
      <p>{text}</p>
    </div>
  );
}
