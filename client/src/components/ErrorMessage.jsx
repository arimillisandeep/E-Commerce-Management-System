export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-container error-box">
      <p className="error-text">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}
