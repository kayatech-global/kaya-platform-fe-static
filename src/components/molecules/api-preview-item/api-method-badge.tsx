'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ApiMethod } from '@/models/api-import.model';

const methodClass: Record<ApiMethod, { text: string; border: string; bg?: string }> = {
    GET: { text: 'text-green-500', border: 'border-green-500' },
    POST: { text: 'text-blue-500', border: 'border-blue-500' },
    PUT: { text: 'text-amber-500', border: 'border-amber-500' },
    PATCH: { text: 'text-amber-500', border: 'border-amber-500' },
    DELETE: { text: 'text-red-500', border: 'border-red-500' },
};

type HttpMethodBadgeProps = {
    method: ApiMethod | string;
    className?: string;
};

export function HttpMethodBadge({ method, className }: Readonly<HttpMethodBadgeProps>) {
    const key = (String(method).toUpperCase() as ApiMethod) ?? 'GET';
    const color = methodClass[key] ?? methodClass.GET;
    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold',
                color.text,
                color.border,
                'bg-transparent',
                className
            )}
        >
            {String(method).toUpperCase()}
        </span>
    );
}

export default HttpMethodBadge;
