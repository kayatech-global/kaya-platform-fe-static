'use client';

import { createContext, useContext, useState, ReactNode, FC, useMemo } from 'react';

export type MainNavItem = 'workspaces' | 'licensing';

interface MainNavigationContextType {
    activeNav: MainNavItem;
    setActiveNav: (nav: MainNavItem) => void;
}

const MainNavigationContext = createContext<MainNavigationContextType | undefined>(undefined);

interface MainNavigationProviderProps {
    children: ReactNode;
}

export const MainNavigationProvider: FC<MainNavigationProviderProps> = ({ children }) => {
    const [activeNav, setActiveNav] = useState<MainNavItem>('workspaces');

    const value = useMemo(
        () => ({
            activeNav,
            setActiveNav,
        }),
        [activeNav]
    );

    return <MainNavigationContext.Provider value={value}>{children}</MainNavigationContext.Provider>;
};

export const useMainNavigation = (): MainNavigationContextType => {
    const context = useContext(MainNavigationContext);
    if (context === undefined) {
        throw new Error('useMainNavigation must be used within a MainNavigationProvider');
    }
    return context;
};
