import * as React from 'react';

import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from './sidebar';
import { NavMain } from './nav-main';
import AppSidebarHeader from './sidebar-header';
import { cn } from '@/lib/utils';
import { SidebarFooterContent } from './sidebar-footer-content';

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    return (
        <Sidebar
            className={cn(
                'sidebar-gradient border-r border-blue-400',
                'dark:bg-gray-900 dark:bg-none dark:border-gray-800'
            )}
            collapsible="icon"
            {...props}
        >
            <AppSidebarHeader />
            <SidebarContent className="mt-3">
                <div className="mr-[3px] pb-2 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-blue-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                    <NavMain />
                </div>
            </SidebarContent>
            <SidebarFooter>
                <SidebarFooterContent />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;
