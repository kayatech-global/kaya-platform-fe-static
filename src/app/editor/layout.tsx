'use client';

import { SidebarInset, SidebarProvider } from '@/components';
import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import AppSidebar from '@/components/molecules/sidebar/app-sidebar';

const DashboardLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <HOCProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="workflow-editor-outer-container h-screen w-full">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </HOCProtectedRoute>
    );
};

export default DashboardLayout;
