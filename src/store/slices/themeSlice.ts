import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeType = 'theme-dark' | 'theme-gold';

export interface ThemeState {
  theme: ThemeType;
}

const initialState: ThemeState = {
  theme: 'theme-dark',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeType>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'theme-dark' ? 'theme-gold' : 'theme-dark';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export const selectTheme = (state: { theme: ThemeState }) => state.theme.theme;

export default themeSlice.reducer;