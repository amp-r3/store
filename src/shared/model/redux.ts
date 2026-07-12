import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<GlobalAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<GlobalRootState> = useSelector;