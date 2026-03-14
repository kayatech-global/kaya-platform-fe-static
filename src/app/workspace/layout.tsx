import { SidebarInset, SidebarProvider } from '@/components/molecules';
import AppSidebar from '@/components/molecules/sidebar/app-sidebar';
import HOCProtectedRoute from '@/components/hoc/hoc-protected-route';
import DashboardHeader from '@/components/molecules/dashboard-header/dashboard-header';
import { AssistantWrapper } from '@/components/organisms/ai-assistant/assistant-wrapper';
import '../globals.css';
import { cn } from '@/lib/utils';

export const metadata = {
    title: 'KAYA AI Platform',
};

const DashboardLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <HOCProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="w-[calc(100vw-325px)]">
                    <DashboardHeader />
                    <div className={cn('dashboard-content h-full bg-[#F1F1F1] px-8', 'dark:bg-[#2B3340]')}>
                        <div className="layout-inner-content -mt-[50px]">{children}</div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
            {/* Context-aware AI Assistant */}
            <AssistantWrapper
                settings={{
                    isEnabled: true,
                    proactiveValidation: true,
                    executionInsights: true,
                    optimizationSuggestions: true,
                }}
            />
        </HOCProtectedRoute>
    );
};

export default DashboardLayout;
