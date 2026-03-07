'use client';

import { Button, PageErrorPlaceholder } from '@/components';
import React from 'react';

const UnAuthorized = () => {
    return (
        <div>
            <PageErrorPlaceholder
                title="Unauthorized"
                description="Sorry, you do not have access to the KAYA AI Platform. Please contact your administrator for access."
                imagePath="/png/user-logo.png"
                footer={
                    <div className="w-full flex justify-center gap-x-2">
                        <Button variant={'secondary'} size={'sm'} onClick={() => (window.location.href = '/')}>
                            Go to Home
                        </Button>
                    </div>
                }
            />
        </div>
    );
};

export default UnAuthorized;
