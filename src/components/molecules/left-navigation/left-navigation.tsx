'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, FileKey2, LayoutDashboard, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
};

// Navigation items - Dashboard appears first, before Workspaces
const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-5" />, href: '/dashboard' },
    { id: 'workspaces', label: 'Workspaces', icon: <Layers className="size-5" />, href: '/workspaces' },
    { id: 'licensing', label: 'Licensing', icon: <FileKey2 className="size-5" />, href: '/licensing' },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="size-5" />, href: '/reports' },
    { id: 'settings', label: 'Settings', icon: <Settings className="size-5" />, href: '/settings' },
];

export const LeftNavigation = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/workspaces') {
            return pathname === '/workspaces' || pathname.startsWith('/workspace');
        }
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={cn(
                'flex flex-col h-screen w-[72px] sidebar-gradient border-r border-blue-400',
                'dark:bg-gray-900 dark:border-gray-800'
            )}
        >
            {/* Logo */}
            <div className="flex items-center justify-center py-5">
                <Image
                    alt="kaya-logo"
                    width={28}
                    height={28}
                    src="/png/kaya-logo-light-small.png"
                    style={{ width: 'auto', height: 'auto' }}
                />
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col items-center gap-2 px-3 mt-4">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={cn(
                            'flex flex-col items-center justify-center w-full py-3 px-2 rounded-lg transition-all',
                            'text-white/70 hover:text-white hover:bg-white/10',
                            {
                                'bg-white/20 text-white': isActive(item.href),
                            }
                        )}
                        title={item.label}
                    >
                        {item.icon}
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default LeftNavigation;
