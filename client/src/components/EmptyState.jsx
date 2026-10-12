export default function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="state-container empty-box">
      <p>{message}</p>
    </div>
  );
}
