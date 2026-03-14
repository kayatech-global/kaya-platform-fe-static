'use client';

import { SidebarInset, SidebarProvider } from '@/components';
import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import AppSidebar from '@/components/molecules/sidebar/app-sidebar';
import { AssistantWrapper } from '@/components/organisms/ai-assistant/assistant-wrapper';

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
            {/* Context-aware AI Assistant - Enhanced for workflow editing */}
            <AssistantWrapper
                settings={{
                    isEnabled: true,
                    proactiveValidation: true, // Validate workflow configurations in real-time
                    executionInsights: true, // Show execution performance insights
                    optimizationSuggestions: true,
                }}
            />
        </HOCProtectedRoute>
    );
};

export default DashboardLayout;
