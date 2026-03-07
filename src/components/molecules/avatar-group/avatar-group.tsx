import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';

export interface AvatarProps {
    img: string;
    fallbackText: string;
}

export interface AvatarGroupProps {
    avatars: AvatarProps[];
}

const AvatarGroup = ({ avatars }: AvatarGroupProps) => {
    return (
        <div className="avatar-group-container flex items-center">
            {avatars.slice(0, 7).map((avatar, index) => (
                <Avatar className="w-7 h-7 -ml-2 border border-white shadow-sm dark:border-gray-400" key={avatar.img ?? avatar.fallbackText ?? `avatar-${index}`}>
                    <AvatarImage src={avatar.img} />
                    <AvatarFallback>
                        <p className="text-xs font-medium text-gray-500">
                            {index === 6 ? avatars.length : avatar.fallbackText}
                        </p>
                    </AvatarFallback>
                </Avatar>
            ))}
        </div>
    );
};

export default AvatarGroup;
