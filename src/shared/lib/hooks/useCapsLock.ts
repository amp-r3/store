import { KeyboardEvent, useCallback, useState } from 'react';

/** Returns handlers to spread onto a password input. Deliberately uses only
 *  onKeyDown/onKeyUp — react-hook-form's `register()` returns
 *  onChange/onBlur/ref/name, so neither collides with it. (FocusEvent has no
 *  getModifierState, so caps lock can only be read from a keyboard event —
 *  there's no way to detect it on plain focus.) */
export const useCapsLock = () => {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const handle = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(event.getModifierState('CapsLock'));
  }, []);

  return {
    isCapsLockOn,
    capsLockProps: {
      onKeyDown: handle,
      onKeyUp: handle,
    },
  };
};
