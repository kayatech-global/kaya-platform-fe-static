import React from 'react';

interface IAgentHoverCardWrapperProps {
    children: React.ReactNode;
    handlePortalRef: (el: HTMLDivElement | null) => void;
    position: { top: number; left: number };
}

export const AgentHoverCardWrapper = ({ children, handlePortalRef, position }: IAgentHoverCardWrapperProps) => {
    return (
        <div
            ref={handlePortalRef}
            className="fixed py-3 pl-3 pr-[1px] bg-background rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto z-[1000]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: 'min(300px, 90vw)',
                maxWidth: '95vw',
                pointerEvents: 'auto',
            }}
        >
            {children}
        </div>
    );
};
