'use client';

import {
    createContext,
    useContext,
    useState,
    ReactNode,
    FC,
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
} from 'react';
import { IKeycloakUser } from '@/models';
import { useParams } from 'next/navigation';

interface AuthContextType {
    user: IKeycloakUser | null;
    setUser: Dispatch<SetStateAction<IKeycloakUser | null>>;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    token: string | undefined;
    isSuperAdmin: boolean;
    setSuperAdmin: Dispatch<SetStateAction<boolean>>;
    isWorkspaceAdmin: boolean;
    setWorkspaceAdmin: Dispatch<SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

interface IWorkspaceInfo {
    id: string;
    name: string;
}

const fetchWorkspaceInfo = async (workspaceId: string) => {
    // Mock workspace response
    return {
        uuid: workspaceId,
        name: 'Mocked Workspace',
    };
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const params = useParams();
    const [user, setUser] = useState<IKeycloakUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | undefined>();
    const [isSuperAdmin, setSuperAdmin] = useState(true);
    const [isWorkspaceAdmin, setWorkspaceAdmin] = useState(true);

    useEffect(() => {
        // Mock authentication process
        const mockUser: IKeycloakUser = {
            id: 'mock-uuid',
            name: 'Mock User',
            email: 'mock@example.com',
            username: 'mockuser',
            firstName: 'Mock',
            lastName: 'User',
            emailVerified: true,
            attributes: {},
            user: {
                id: 1,
                groups: [],
                workspaces: [],
            },
        };

        setToken('mock-token');
        setUser(mockUser);
        setSuperAdmin(true);
    }, []);

    useEffect(() => {
        (async () => {
            if (params?.wid && user?.user) {
                setWorkspaceAdmin(true);
                await manageStorage();
            } else {
                setWorkspaceAdmin(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.user, params?.wid]);

    const setWorkspaceInfo = async () => {
        setLoading(true);
        const result = await fetchWorkspaceInfo(params?.wid as string);
        const workspace = { id: result.uuid, name: result.name };
        localStorage.setItem('workspaceInfo', JSON.stringify(workspace));
        setLoading(false);
    };

    const getWorkspaceInfo = () => {
        const workspaceInfo = localStorage.getItem('workspaceInfo');
        if (workspaceInfo) {
            return JSON.parse(workspaceInfo) as IWorkspaceInfo | undefined;
        }
        return undefined;
    };

    const manageStorage = async () => {
        const workspaceInfo = getWorkspaceInfo();

        if (!localStorage.getItem('workspaceInfo') || params?.wid !== workspaceInfo?.id?.toString()) {
            await setWorkspaceInfo();
        }
    };

    const value = useMemo(
        () => ({
            user,
            setUser,
            loading,
            setLoading,
            token,
            isSuperAdmin,
            setSuperAdmin,
            isWorkspaceAdmin,
            setWorkspaceAdmin,
        }),
        [user, loading, token, isSuperAdmin, isWorkspaceAdmin]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
