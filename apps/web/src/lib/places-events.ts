const target = new EventTarget();

export const PLACE_CREATED_EVENT = 'place-created';

export function emitPlaceCreated() {
  target.dispatchEvent(new Event(PLACE_CREATED_EVENT));
}

export function onPlaceCreated(callback: () => void) {
  target.addEventListener(PLACE_CREATED_EVENT, callback);
  return () => target.removeEventListener(PLACE_CREATED_EVENT, callback);
}
