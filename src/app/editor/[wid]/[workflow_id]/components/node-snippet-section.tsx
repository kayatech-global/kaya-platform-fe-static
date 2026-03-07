import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface NodeSnippetSectionProps {
    surroundingNodeImages: (string | null)[];
}

export const NodeSnippetSection = ({ surroundingNodeImages }: NodeSnippetSectionProps) => {
    return (
        <div className="snippet-section bg-gray-300 dark:bg-gray-700 rounded h-[94px] flex items-center justify-between relative overflow-clip">
            {surroundingNodeImages?.map((nodeImage: string | null, index: number) => {
                return (
                    <React.Fragment key={`${typeof nodeImage === 'string' ? nodeImage : 'placeholder'}-${index}`}>
                        {nodeImage == null ? (
                            <div className="w-[48px]" />
                        ) : (
                            <Image
                                src={nodeImage}
                                alt="node_image"
                                width={index === 1 ? 85 : 48}
                                height={index === 1 ? 74 : 48}
                                className={cn('z-20', {
                                    'relative -left-2 opacity-65': index === 0,
                                    'relative -right-2 opacity-65': index === 2,
                                    'relative bottom-[2px]': index === 1,
                                })}
                            />
                        )}
                    </React.Fragment>
                );
            })}
            {surroundingNodeImages?.[0] != null && (
                <div className="line-start absolute h-[1px] w-24 left-[40px] z-10 node-snippet-connector-line-gradient-bg-left" />
            )}
            {surroundingNodeImages?.[2] != null && (
                <div className="line-end absolute h-[1px] w-20 right-[40px] z-10 node-snippet-connector-line-gradient-bg-right" />
            )}
        </div>
    );
};
