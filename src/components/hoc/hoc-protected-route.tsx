'use client';

import { ReactNode, JSX } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

const HOCProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
    return <>{children}</>;
};

export default HOCProtectedRoute;
