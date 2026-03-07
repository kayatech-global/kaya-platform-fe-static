'use client';
import { IGuardrailSetup, ISharedItem } from '@/models';
import { createContext, useContext, useMemo, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { CustomNodeProps } from '@/components';
import { NODE_LIST } from '@/constants/editor-constants';

// Define the type for the context value
type DnDContextType = {
    type: string | null;
    setType: Dispatch<SetStateAction<string | null>>;
    selectedNodeId: string | undefined;
    setSelectedNodeId: Dispatch<SetStateAction<string | undefined>>;
    workflowVariables: ISharedItem[];
    setWorkflowVariables: React.Dispatch<React.SetStateAction<ISharedItem[]>>;
    sharedVariables: ISharedItem[];
    setSharedVariables: React.Dispatch<React.SetStateAction<ISharedItem[]>>;
    trigger: number | undefined;
    setTrigger: React.Dispatch<React.SetStateAction<number | undefined>>;
    recentUsed: CustomNodeProps[];
    setRecentUsed: React.Dispatch<React.SetStateAction<CustomNodeProps[]>>;
    guardrailStore: IGuardrailSetup[];
    setGuardrailStore: React.Dispatch<React.SetStateAction<IGuardrailSetup[]>>;
    isVoiceWorkflow: boolean;
    setIsVoiceWorkflow: React.Dispatch<React.SetStateAction<boolean>>;
    loadingIntellisense: boolean;
    setLoadingIntellisense: React.Dispatch<React.SetStateAction<boolean>>;
};

// Create context with proper typing and a default value
const DnDContext = createContext<DnDContextType>({
    type: null,
    setType: () => {},
    selectedNodeId: undefined,
    setSelectedNodeId: () => {},
    workflowVariables: [],
    setWorkflowVariables: () => {},
    sharedVariables: [],
    setSharedVariables: () => {},
    trigger: undefined,
    setTrigger: () => {},
    recentUsed: [],
    setRecentUsed: () => {},
    guardrailStore: [],
    setGuardrailStore: () => {},
    isVoiceWorkflow: false,
    setIsVoiceWorkflow: () => {},
    loadingIntellisense: false,
    setLoadingIntellisense: () => {},
});

interface DnDProviderProps {
    children: ReactNode;
}

export const DnDProvider = ({ children }: DnDProviderProps) => {
    const [type, setType] = useState<string | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string>();
    const [workflowVariables, setWorkflowVariables] = useState<ISharedItem[]>([]);
    const [sharedVariables, setSharedVariables] = useState<ISharedItem[]>([]);
    // Used to trigger dependent useEffect (in editor-playground.tsx) (e.g., for refetching Intellisense data).
    const [trigger, setTrigger] = useState<number | undefined>(undefined);
    const [recentUsed, setRecentUsed] = useState<CustomNodeProps[]>([
        ...(NODE_LIST.find(category => category.category === 'recent_used')?.nodes ?? []),
    ]);
    const [isVoiceWorkflow, setIsVoiceWorkflow] = useState(false);
    // Used to store guardrails to display real values in agent hover card
    const [guardrailStore, setGuardrailStore] = useState<IGuardrailSetup[]>([]);
    // Used to indicate loading state for Intellisense
    const [loadingIntellisense, setLoadingIntellisense] = useState<boolean>(false);

    const contextValue = useMemo(
        () => ({
            type,
            setType,
            selectedNodeId,
            setSelectedNodeId,
            workflowVariables,
            setWorkflowVariables,
            sharedVariables,
            setSharedVariables,
            trigger,
            setTrigger,
            recentUsed,
            setRecentUsed,
            guardrailStore,
            setGuardrailStore,
            isVoiceWorkflow,
            setIsVoiceWorkflow,
            loadingIntellisense,
            setLoadingIntellisense,
        }),
        [
            type,
            setType,
            selectedNodeId,
            setSelectedNodeId,
            workflowVariables,
            setWorkflowVariables,
            sharedVariables,
            setSharedVariables,
            trigger,
            setTrigger,
            recentUsed,
            setRecentUsed,
            guardrailStore,
            setGuardrailStore,
            isVoiceWorkflow,
            setIsVoiceWorkflow,
            loadingIntellisense,
            setLoadingIntellisense,
        ]
    );

    return (
        <DnDContext.Provider value={contextValue}>
            {children}
        </DnDContext.Provider>
    );
};

// Custom hook with proper return type
export const useDnD = (): DnDContextType => {
    return useContext(DnDContext);
};

export default DnDContext;
