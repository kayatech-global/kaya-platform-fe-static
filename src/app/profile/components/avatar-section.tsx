'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/atoms/card';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/atoms/avatar';
import { Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IUserProfile } from '@/models/profile.model';
import { toast } from 'sonner';

interface AvatarSectionProps {
    profile: IUserProfile;
}

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const AvatarSection = ({ profile }: AvatarSectionProps) => {
    const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
    const [previewUrl, setPreviewUrl] = useState(profile.avatarUrl ?? '');

    const handleUrlApply = () => {
        setPreviewUrl(avatarUrl);
        toast.success('Avatar URL updated (prototype only)');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (PNG, JPG, GIF, WebP)');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setAvatarUrl('');
        toast.success(`Avatar updated to ${file.name} (prototype only)`);
    };

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="pb-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-100">Profile Photo</p>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-x-6">
                    <div className="relative group shrink-0">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={previewUrl || undefined} />
                            <AvatarFallback
                                className={cn(
                                    'text-xl font-semibold bg-blue-600 text-white',
                                    'dark:bg-blue-700'
                                )}
                            >
                                {getInitials(profile.firstName, profile.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <label
                            htmlFor="avatar-file-upload"
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera size={20} className="text-white" />
                        </label>
                        <input
                            id="avatar-file-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex flex-col gap-y-3 flex-1">
                        <div className="flex items-end gap-x-2">
                            <Input
                                label="Avatar URL"
                                placeholder="https://example.com/avatar.png"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                containerClassName="flex-1"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleUrlApply}
                                disabled={!avatarUrl}
                            >
                                Apply
                            </Button>
                        </div>
                        <div className="flex items-center gap-x-3">
                            <label htmlFor="avatar-file-upload-btn">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    leadingIcon={<Upload size={14} />}
                                    onClick={() => document.getElementById('avatar-file-upload')?.click()}
                                >
                                    Upload Image
                                </Button>
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG, GIF, or WebP. Max 2MB.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
