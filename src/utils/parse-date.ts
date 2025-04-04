export function parseDate(input?: any) {
  if (!input) {
    return null;
  }

  if (input instanceof Date) {
    return input;
  }

  if (typeof input === 'string' || typeof input === 'number') {
    return new Date(input);
  }

  if (typeof input.toDate === 'function') {
    return input.toDate();
  }

  if (typeof input === 'object') {
    return new Date(input._seconds * 1000 + input._nanoseconds / 1000000);
  }

  return null;
}
