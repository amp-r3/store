import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';

export const useAppDispatch = () => useDispatch<GlobalAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<GlobalRootState> = useSelector;
/** For reading fresh state inside an event callback (e.g. a Supabase
 * onAuthStateChange listener) without resubscribing the effect on every
 * state change — useAppSelector's closure would go stale there. */
export const useAppStore = () => useStore<GlobalRootState>();
