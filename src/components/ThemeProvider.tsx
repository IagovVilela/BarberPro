'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light', toggleTheme: () => { } });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const saved = localStorage.getItem('barberpro-theme') as Theme;
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem('barberpro-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
