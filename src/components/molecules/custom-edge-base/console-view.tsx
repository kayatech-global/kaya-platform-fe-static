import { ConsoleMessage } from '@/hooks/use-condition-completion';
import { Terminal } from 'lucide-react';
import React from 'react';

interface ConsoleProps {
    messages: ConsoleMessage[];
}

export const ConsoleView: React.FC<ConsoleProps> = ({ messages }) => {
    return (
        <div className="bg-gray-100 dark:bg-[#282c34] text-foreground rounded-md">
            <div className="flex items-center gap-x-1 text-[10px] py-1 px-2 bg-gray-200 dark:bg-gray-700 text-foreground rounded-t-md">
                <Terminal size={12} /> Console
            </div>
            <div className="p-3 h-16 overflow-y-auto text-xs">
                {messages.length === 0 ? (
                    <></>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={`${msg.timestamp}-${index}`}
                            className={`mb-2 ${(() => {
                                if (msg.type === 'error') return 'text-red-400';
                                if (msg.type === 'warning') return 'text-yellow-400';
                                return 'text-green-400';
                            })()}`}
                        >
                            <span>{msg.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
