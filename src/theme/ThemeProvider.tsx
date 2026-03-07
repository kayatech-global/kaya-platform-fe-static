'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps, useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

/**
 * ThemeProvider component that wraps the application with theme context.
 * It uses the NextThemesProvider to manage theme switching and applies
 * the necessary attributes and properties.
 *
 * @param {ThemeProviderProps} props - The properties passed to the ThemeProvider.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the ThemeProvider.
 * @returns {JSX.Element | null} The rendered ThemeProvider component or null if not mounted.
 *
 * @component
 * @example
 * return (
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * )
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange {...props}>
            {children}
        </NextThemesProvider>
    );
}

// Corrected custom hook to use theme
export function useTheme() {
    const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();

    const updateTheme = React.useCallback(
        (newTheme: Theme) => {
            setNextTheme(newTheme);
        },
        [setNextTheme]
    );

    return {
        theme: (resolvedTheme || theme) as Theme,
        setTheme: updateTheme,
    };
}
