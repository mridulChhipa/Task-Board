export function formatDate(iso: Date) {
  if (!iso) {
    return null;
  }
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(iso: Date) {
  if (!iso) {
    return false;
  }
  return new Date(iso) < new Date();
}
