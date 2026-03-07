'use client';
import React, { useState } from 'react';
import { Input } from './input';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    containerClassName?: string;
    helperInfo?: string | React.ReactNode;
    trailingIconClass?: string;
    loading?: boolean;
}

const SecretInput = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const [show, setShow] = useState<boolean>(false);

    return (
        <Input
            ref={ref}
            {...props}
            trailingIcon={
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="bg-transparent border-none p-0 cursor-pointer"
                    aria-label={show ? 'Hide password' : 'Show password'}
                >
                    {show ? <EyeOff /> : <Eye />}
                </button>
            }
            type={show ? 'text' : 'password'}
        />
    );
});
SecretInput.displayName = 'SecretInput';

export { SecretInput };
