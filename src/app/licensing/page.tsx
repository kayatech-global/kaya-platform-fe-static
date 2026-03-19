import React from 'react';
import { FileKey2 } from 'lucide-react';

const LicensingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <FileKey2 className="size-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Licensing
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Manage your licenses, user seats, and billing information here.
            </p>
        </div>
    );
};

export default LicensingPage;
