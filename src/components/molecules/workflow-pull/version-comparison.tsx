import React from 'react';
import Image from 'next/image';

interface VersionComparisonProps {
    currentVersion: string;
    incomingVersion: string;
}

export const VersionComparison = ({ currentVersion, incomingVersion }: VersionComparisonProps) => {
    return (
        <div className="flex items-center justify-center w-full pb-2">
            <div className="flex items-center gap-x-2 w-[240px]">
                <div className="relative flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10">
                        <Image
                            src="/png/codesandbox.png"
                            alt="workflow icon"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <p
                        title="Current version"
                        className="relative top-1 text-[10px] font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {currentVersion}
                    </p>
                </div>
                <div className="w-full border-t-2 border-dashed border-blue-400" />
                <div className="flex">
                    <Image src="/png/recycle.png" alt="sync icon" width={120} height={120} className="object-contain" />
                </div>
                <div className="w-full border-t-2 border-dashed border-blue-400" />
                <div className="relative flex flex-col items-center">
                    <div className="flex items-center justify-center w-10 h-10">
                        <Image
                            src="/png/codesandbox.png"
                            alt="workflow icon"
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                    <p
                        title="Incoming version"
                        className="relative top-1 text-[10px] font-semibold text-gray-900 dark:text-gray-100"
                    >
                        {incomingVersion}
                    </p>
                </div>
            </div>
        </div>
    );
};
