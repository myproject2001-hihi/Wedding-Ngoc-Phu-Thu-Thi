/**
 * Checks whether the invitation is opened in Test Mode (?test=true or #test).
 * In Test Mode, all UI flows (sending wishes, thank-you modal, RSVP submission,
 * fireworks, toast) work normally, but NO data is written to Firebase or local storage.
 */
export function isTestMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const testParam = params.get('test');
  const hash = window.location.hash.toLowerCase();
  return (
    (testParam !== null && testParam.toLowerCase() !== 'false' && testParam !== '0') ||
    hash === '#test'
  );
}
