import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from '../storage';


export type ThemeType = 'theme-dark' | 'theme-light';

export interface ThemeState {
  theme: ThemeType;
}

const themePersistConfig = {
  key: 'theme',
  storage,
};

const initialState: ThemeState = {
  theme: 'theme-light',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'theme-dark' ? 'theme-light' : 'theme-dark';
    },
  },
});


const persistedThemeReducer = persistReducer(themePersistConfig, themeSlice.reducer);

export const { setTheme, toggleTheme } = themeSlice.actions;

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;

export default persistedThemeReducer;