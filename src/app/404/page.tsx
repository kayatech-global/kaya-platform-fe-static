'use client';

import { Button, PageErrorPlaceholder } from '@/components';
import { useRouter } from 'next/navigation';
import React from 'react';

const AccessDenied = () => {
    const router = useRouter();

    return (
        <div>
            <PageErrorPlaceholder
                title="Page not found"
                description="Sorry, the page you're looking for does not exist"
                imagePath="/png/empty-state.png"
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
