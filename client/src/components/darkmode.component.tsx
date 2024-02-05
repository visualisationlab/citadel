import {createContext,useState} from 'react';

export const themeContext = createContext<ThemeContextProps | undefined>(undefined);

export type Theme = 'light' | 'dark';
type ThemeContextProps = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};