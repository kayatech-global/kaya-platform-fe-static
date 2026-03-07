'use client';

import { Button, PageErrorPlaceholder } from '@/components';
import { useRouter } from 'next/navigation';
import React from 'react';

const AccessDenied = () => {
    const router = useRouter();

    return (
        <div>
            <PageErrorPlaceholder
                title="Access Denied"
                description="Sorry, you have not been assigned this workspace on KAYA AI Platform. Please contact your admin for access"
                imagePath="/png/lock.png"
                footer={
                    <div className="w-full flex justify-center gap-x-2">
                        <Button variant={'secondary'} size={'sm'} onClick={() => router.push('/')}>
                            Go to home
                        </Button>
                    </div>
                }
            />
        </div>
    );
};

export default AccessDenied;
