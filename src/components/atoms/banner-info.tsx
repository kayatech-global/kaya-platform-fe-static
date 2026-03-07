import React from 'react';
interface BannerInfoProps {
    icon?: string;
    label: string | React.ReactNode;
}

export const BannerInfo = ({ icon, label }: BannerInfoProps) => {
    return (
        <div className="w-full p-2 rounded border border-blue-600 bg-blue-100 flex items-center gap-x-2">
            {icon && <i className={`${icon} text-blue-600 text-lg`} />}
            {typeof label === 'string' && <p className="text-sm text-blue-600 flex items-center gap-x-2">{label}</p>}
            {typeof label !== 'string' && label}
        </div>
    );
};
