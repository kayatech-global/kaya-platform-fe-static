'use client';

import React from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from './drawer';
import { X } from 'lucide-react';
import { cn, renderIcon } from '@/lib/utils';

interface AppDrawerProps {
    header?: React.ReactNode;
    headerIcon?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    open: boolean;
    setOpen: (isOpen: boolean) => void;
    isPlainContentSheet?: boolean;
    direction?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
    dismissible?: boolean;
    bodyClassName?: string;
    hideClose?: boolean;
}

const AppDrawer = ({
    open,
    setOpen,
    header,
    headerIcon,
    footer,
    content,
    isPlainContentSheet = false,
    direction = 'right',
    className,
    dismissible = true,
    bodyClassName = '',
    hideClose = false,
}: AppDrawerProps) => {
    return (
        <Drawer open={open} onClose={() => setOpen(false)} direction={direction} dismissible={dismissible}>
            <DrawerContent className={cn('w-fit', className)}>
                <DrawerHeader className={cn({ hidden: !header })}>
                    <DrawerTitle className="flex justify-between items-center ">
                        <div className="flex items-center gap-x-2">
                            {headerIcon && (
                                <div className="bg-blue-100 flex items-center justify-center w-8 h-8 rounded dark:bg-blue-900">
                                    {renderIcon(headerIcon, 16, 'text-blue-600 dark:text-blue-200')}
                                </div>
                            )}
                            <div className="text-md font-regular text-gray-900 dark:text-gray-50">{header}</div>
                        </div>
                        {!hideClose && (
                            <DrawerClose onClick={() => setOpen(false)}>
                                <X className="text-gray-600 dark:text-gray-100" size={16} />
                            </DrawerClose>
                        )}
                    </DrawerTitle>
                </DrawerHeader>
                <div
                    className={cn(
                        {
                            'drawer-body px-2 drawer-overflow [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-300 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500 mr-[2px] my-[2px]':
                                !isPlainContentSheet,
                            'px-0 py-0 overflow-hidden': isPlainContentSheet,
                        },
                        bodyClassName
                    )}
                >
                    {content}
                </div>
                <DrawerFooter className={cn({ hidden: !footer })}>{footer}</DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default AppDrawer;
