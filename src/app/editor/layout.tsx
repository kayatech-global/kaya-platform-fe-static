'use client';

import { SidebarInset, SidebarProvider } from '@/components';
import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import AppSidebar from '@/components/molecules/sidebar/app-sidebar';
import { MainNavigationProvider } from '@/context/main-navigation-context';

const DashboardLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <HOCProtectedRoute>
            <MainNavigationProvider>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <div className="workflow-editor-outer-container h-screen w-full">{children}</div>
                    </SidebarInset>
                </SidebarProvider>
            </MainNavigationProvider>
        </HOCProtectedRoute>
    );
};

export default DashboardLayout;
