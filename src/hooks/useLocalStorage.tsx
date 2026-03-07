import { useState, useEffect } from 'react';

interface WorkspaceInfo {
    id: string;
    name: string;
}

const useWorkspaceStorage = (key: string) => {
    // State to store workspace info
    const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | undefined>(undefined);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                setWorkspaceInfo(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error reading localStorage key:', key, error);
        }
    }, [key]);

    // Function to update localStorage and state
    const setValue = (value: WorkspaceInfo | ((val: WorkspaceInfo | undefined) => WorkspaceInfo)) => {
        try {
            const valueToStore = value instanceof Function ? value(workspaceInfo) : value;
            setWorkspaceInfo(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error setting localStorage key:', key, error);
        }
    };

    return [workspaceInfo, setValue] as const;
};

export default useWorkspaceStorage;
