import {createContext,useState} from 'react';

export const themeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

