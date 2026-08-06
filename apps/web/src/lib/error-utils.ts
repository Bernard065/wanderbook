export function extractMessageString(err: unknown): string {
  const maybeMessage = (err as { message?: unknown })?.message;
  if (typeof maybeMessage === 'string') return maybeMessage;
  if (typeof maybeMessage === 'object' && maybeMessage !== null)
    try {
      return JSON.stringify(maybeMessage);
    } catch {
      return String(maybeMessage);
    }
  return String(err);
}

export function extractJsonFromMessage(msg: string): unknown | null {
  const braceIndex = msg.indexOf('{');
  if (braceIndex >= 0) {
    const maybe = msg.slice(braceIndex);
    try {
      return JSON.parse(maybe);
    } catch {
      return null;
    }
  }
  const parts = msg.split('—').map((p) => p.trim());
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    try {
      return JSON.parse(last);
    } catch {
      return null;
    }
  }
  return null;
}
