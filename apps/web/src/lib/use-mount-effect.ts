// oxlint-disable-next-line no-restricted-imports -- the one sanctioned useEffect
import { useEffect } from "react";

// Setup on mount, cleanup on unmount, for syncing with something outside React. To restart it
// when a value changes, key the component by that value.
export function useMountEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}
