export function make_date(date: string): string {
  const today = new Date();
  const dateObj = new Date(date);
  if (
    today.getFullYear() === dateObj.getFullYear() &&
    today.getMonth() === dateObj.getMonth() &&
    today.getDate() === dateObj.getDate()
  ) {
    return dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (
    today.getFullYear() === dateObj.getFullYear() &&
    today.getMonth() === dateObj.getMonth()
  ) {
    return dateObj.getDate().toString();
  } else if (today.getFullYear() === dateObj.getFullYear()) {
    return dateObj.getMonth().toString();
  } else {
    return dateObj.getFullYear().toString();
  }
}

export function formatDate(iso: Date) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isOverdue(iso: Date) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}
