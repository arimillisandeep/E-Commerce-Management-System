import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';

// Reusable data-fetching state wrapper (loading / error / empty / children)
export default function DataState({ loading, error, empty, emptyMessage, children }) {
  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;
  if (empty) return <EmptyState message={emptyMessage || 'No data found.'} />;
  return children;
}
