export function showToast(message: string) {
  // If the app provides a global toast handler, use it.
  if (typeof window === 'undefined') {
    // server-side: no-op

    console.warn('showToast called on server:', message);
    return;
  }

  try {
    window.dispatchEvent(
      new CustomEvent('wanderbook:toast', {
        detail: { message, intent: 'info' },
      }),
    );
  } catch (err) {
    console.warn('Failed to dispatch toast event', err);
  }
}

export function showErrorToast(message: string) {
  if (typeof window === 'undefined') {
    console.warn('showErrorToast called on server:', message);
    return;
  }

  try {
    window.dispatchEvent(
      new CustomEvent('wanderbook:toast', {
        detail: { message, intent: 'error' },
      }),
    );
  } catch (err) {
    console.warn('Failed to dispatch toast event', err);
  }
}
