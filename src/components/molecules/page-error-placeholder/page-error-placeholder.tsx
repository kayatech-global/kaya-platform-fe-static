import React from 'react';
import Image from 'next/image';

interface PageErrorPlaceholderProps {
    title: string;
    description: string;
    imagePath: string;
    footer?: React.ReactNode;
}

export const PageErrorPlaceholder = ({ title, description, imagePath, footer }: PageErrorPlaceholderProps) => {
    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center">
            <div className="error-page-inner-container flex flex-col gap-y-6 items-center">
                <Image layout="intrinsic" width={150} height={150} src={imagePath} alt="error page illustration" />
                <div className="error-message-container flex flex-col items-center">
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</p>
                    <p className="text-center text-sm font-normal text-gray-600 max-w-[400px] dark:text-gray-400">
                        {description}
                    </p>
                </div>
                {footer && <div className="error-footer">{footer}</div>}
            </div>
        </div>
    );
};
