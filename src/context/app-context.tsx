'use client';

import { ComponentType } from '@/enums';
import { IGuardrailBinding, IPlatformSettingData } from '@/models';
import React, { createContext, Dispatch, FC, ReactNode, SetStateAction, useContext, useMemo, useState } from 'react';

export enum WorkspacePageEnum {
    BASE = '/',
    USAGE = 'Usage',
}

export type LoadingStateType = {
    page: WorkspacePageEnum;
    state: boolean;
};

type AppContextType = {
    // State keep track of entire application loadings
    isAppLoading: LoadingStateType;
    setIsAppLoading: Dispatch<SetStateAction<LoadingStateType>>;
    // State to keep track of workspace page loading with sidebar
    isWorkspacePageLoading: LoadingStateType;
    setIsWorkspacePageLoading: Dispatch<SetStateAction<LoadingStateType>>;
    failedComponents: ComponentType[];
    setFailedComponents: Dispatch<SetStateAction<ComponentType[]>>;
    intelligentSource: IPlatformSettingData | undefined;
    setIntelligentSource: Dispatch<SetStateAction<IPlatformSettingData | undefined>>;
    guardrailBinding: IGuardrailBinding[] | undefined;
    setGuardrailBinding: Dispatch<SetStateAction<IGuardrailBinding[] | undefined>>;
    triggerGuardrailBinding: number;
    setTriggerGuardrailBinding: Dispatch<SetStateAction<number>>;
};

interface AppContextProviderProps {
    children: ReactNode;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
    const [isAppLoading, setIsAppLoading] = useState<LoadingStateType>({ page: WorkspacePageEnum.BASE, state: false });
    const [isWorkspacePageLoading, setIsWorkspacePageLoading] = useState<LoadingStateType>({
        page: WorkspacePageEnum.BASE,
        state: true,
    });
    const [failedComponents, setFailedComponents] = useState<ComponentType[]>([]);
    const [intelligentSource, setIntelligentSource] = useState<IPlatformSettingData | undefined>(undefined);
    const [guardrailBinding, setGuardrailBinding] = useState<IGuardrailBinding[] | undefined>(undefined);
    const [triggerGuardrailBinding, setTriggerGuardrailBinding] = useState<number>(0);

    const contextValue = useMemo(
        () => ({
            isAppLoading,
            setIsAppLoading,
            isWorkspacePageLoading,
            setIsWorkspacePageLoading,
            failedComponents,
            setFailedComponents,
            intelligentSource,
            setIntelligentSource,
            guardrailBinding,
            setGuardrailBinding,
            triggerGuardrailBinding,
            setTriggerGuardrailBinding,
        }),
        [
            isAppLoading,
            setIsAppLoading,
            isWorkspacePageLoading,
            setIsWorkspacePageLoading,
            failedComponents,
            setFailedComponents,
            intelligentSource,
            setIntelligentSource,
            guardrailBinding,
            setGuardrailBinding,
            triggerGuardrailBinding,
            setTriggerGuardrailBinding,
        ]
    );

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppContext Provider');
    }
    return context;
};
