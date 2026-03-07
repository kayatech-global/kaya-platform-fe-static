import { Spinner } from '@/components';
import Image from 'next/image';
import React from 'react';

interface IPullingStep {
    isEnvValuePosting: boolean;
    isEnvValuePostingSuccess: boolean;
    isPulling: boolean;
    isPullingSuccess: boolean;
}

export const PullingStep = ({
    isEnvValuePosting,
    isEnvValuePostingSuccess,
    isPulling,
    isPullingSuccess,
}: IPullingStep) => {
    const isComplete = isEnvValuePostingSuccess && isPullingSuccess;

    return (
        <div className="flex flex-col items-center mt-6 pb-16">
            {/* GIF */}
            <div className="flex items-center justify-center rounded-md">
                <Image
                    src={isComplete ? '/png/Success3.gif' : '/png/Pull11.gif'}
                    alt="Pulling Workflow"
                    width={150}
                    height={150}
                />
            </div>

            {/* Success Message */}
            {isComplete && (
                <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mt-6 animate-pulse">
                    Workflow Successfully Pulled!
                </h3>
            )}

            {/* Steps */}
            <div className="flex flex-col gap-y-6 mt-8 w-full max-w-[380px] items-center justify-center">
                {/* Step 1 */}
                <div className="flex items-start gap-x-3">
                    <div className="mt-1">
                        {(() => {
                            if (isEnvValuePosting) return <Spinner />;
                            if (isEnvValuePostingSuccess) return <div className="w-3 h-3 rounded-full bg-green-500" />;
                            return <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />;
                        })()}
                    </div>

                    <div>
                        <p
                            className={`font-medium ${
                                isEnvValuePosting || isEnvValuePostingSuccess
                                    ? 'text-gray-900 dark:text-gray-100'
                                    : 'text-gray-500 '
                            }`}
                        >
                            Configuring Environment Variables
                        </p>
                        <p className="text-xs text-gray-400">Applying your custom settings and secrets...</p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-x-3">
                    <div className="mt-1">
                        {(() => {
                            if (isPulling) return <Spinner />;
                            if (isPullingSuccess) return <div className="w-3 h-3 rounded-full bg-green-500" />;
                            return <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />;
                        })()}
                    </div>

                    <div>
                        <p
                            className={`font-medium ${
                                isPulling || isPullingSuccess ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
                            }`}
                        >
                            Retrieving Workflow Artifacts
                        </p>
                        <p className="text-xs text-gray-400">Fetching the latest version from the registry...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
