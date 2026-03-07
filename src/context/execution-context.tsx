'use client';
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

interface BackgroundExecutionState {
    sessionId: string | null;
    isMinimized: boolean;
    testSuiteId?: string;
    isSilent?: boolean; // True when running without mini tracker
    miniTrackerEnabled?: boolean; // Tracks if mini tracker toggle was enabled
}

interface ExecutionContextType {
    backgroundExecution: BackgroundExecutionState;
    startBackgroundExecution: (sessionId: string, testSuiteId?: string, miniTrackerEnabled?: boolean) => void;
    startSilentExecution: (sessionId: string, testSuiteId?: string) => void;
    stopBackgroundExecution: () => void;
    expandExecution: () => void;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export const ExecutionProvider = ({ children }: { children: ReactNode }) => {
    const [backgroundExecution, setBackgroundExecution] = useState<BackgroundExecutionState>({
        sessionId: null,
        isMinimized: false,
    });

    const startBackgroundExecution = useCallback((sessionId: string, testSuiteId?: string, miniTrackerEnabled?: boolean) => {
        setBackgroundExecution({
            sessionId,
            isMinimized: true,
            testSuiteId,
            isSilent: false,
            miniTrackerEnabled,
        });
    }, []);

    const startSilentExecution = useCallback((sessionId: string, testSuiteId?: string) => {
        setBackgroundExecution({
            sessionId,
            isMinimized: false,
            testSuiteId,
            isSilent: true,
            miniTrackerEnabled: false,
        });
    }, []);

    const stopBackgroundExecution = useCallback(() => {
        setBackgroundExecution({
            sessionId: null,
            isMinimized: false,
        });
    }, []);

    const expandExecution = useCallback(() => {
        setBackgroundExecution((prev) => ({
            ...prev,
            isMinimized: false,
        }));
    }, []);

    const contextValue = useMemo(() => ({
        backgroundExecution,
        startBackgroundExecution,
        startSilentExecution,
        stopBackgroundExecution,
        expandExecution,
    }), [backgroundExecution, startBackgroundExecution, startSilentExecution, stopBackgroundExecution, expandExecution]);

    return (
        <ExecutionContext.Provider value={contextValue}>
            {children}
        </ExecutionContext.Provider>
    );
};

export const useExecutionContext = () => {
    const context = useContext(ExecutionContext);
    if (context === undefined) {
        throw new Error('useExecutionContext must be used within an ExecutionProvider');
    }
    return context;
};
