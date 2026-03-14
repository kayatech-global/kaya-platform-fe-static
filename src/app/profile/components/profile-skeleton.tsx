'use client';

import { Card, CardContent, CardHeader, Skeleton, Separator } from '@/components/atoms';

const FieldSkeleton = () => (
    <div className="flex flex-col gap-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
    </div>
);

export const ProfileSkeleton = () => {
    return (
        <div className="flex flex-col gap-y-6">
            {/* Avatar skeleton */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="flex items-center gap-x-6">
                    <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                    <div className="flex flex-col gap-y-3 flex-1">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-48" />
                    </div>
                </CardContent>
            </Card>

            {/* Personal info skeleton */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-44" />
                </CardHeader>
                <CardContent className="flex flex-col gap-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FieldSkeleton />
                        <FieldSkeleton />
                    </div>
                    <FieldSkeleton />
                    <FieldSkeleton />
                </CardContent>
            </Card>

            {/* Timezone skeleton */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-28" />
                </CardHeader>
                <CardContent>
                    <FieldSkeleton />
                </CardContent>
            </Card>

            <Separator />

            {/* Roles skeleton */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-56" />
                </CardHeader>
                <CardContent className="flex flex-col gap-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-x-3">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Account metadata skeleton */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <FieldSkeleton />
                    <FieldSkeleton />
                </CardContent>
            </Card>
        </div>
    );
};
