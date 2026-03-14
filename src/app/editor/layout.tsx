'use client';

import { SidebarInset, SidebarProvider, FloatingAssistantWidget } from '@/components';
import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import AppSidebar from '@/components/molecules/sidebar/app-sidebar';
import { AssistantProvider } from '@/context/assistant-context';

const DashboardLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <HOCProtectedRoute>
            <SidebarProvider>
                <AssistantProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <div className="workflow-editor-outer-container h-screen w-full">{children}</div>
                    </SidebarInset>
                    <FloatingAssistantWidget />
                </AssistantProvider>
            </SidebarProvider>
        </HOCProtectedRoute>
    );
};

export default DashboardLayout;
