import * as React from 'react';
import { cn, renderIcon } from '@/lib/utils';
import { Label } from './label';

interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    initialValue?: string;
    onMaskChange: (value: string) => void;
}

const MaskedInput = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            label,
            supportiveText,
            leadingIcon,
            trailingIcon,
            isDestructive = false,
            initialValue,
            onMaskChange,
            ...props
        },
        ref
    ) => {
        const [realValue, setRealValue] = React.useState<string>('');
        const [isPasting, setIsPasting] = React.useState(false);
        const [pastedValue, setIsPastedValue] = React.useState('');

        React.useEffect(() => {
            if (initialValue) {
                setRealValue(initialValue);
            }
        }, [initialValue]);

        const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            const prevLength = realValue.length;
            let updated = realValue;

            if (isPasting && pastedValue !== '') {
                updated += pastedValue;
                setIsPasting(false);
                setIsPastedValue('');
            } else if (inputValue.length < prevLength) {
                updated = updated.slice(0, inputValue.length);
            } else {
                const newChar = inputValue.charAt(inputValue.length - 1);
                updated += newChar;
            }

            setRealValue(updated);
            onMaskChange(updated);
        };

        const getMaskedValue = React.useMemo(() => {
            return realValue.replace(/.(?=.{4})/g, '*');
        }, [realValue]);

        return (
            <div className="flex flex-col items-start gap-y-[6px] w-full">
                <div className="flex flex-col items-start gap-y-[6px] w-full">
                    {label && (
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-100" htmlFor={props.id}>
                            {label}
                        </Label>
                    )}
                    <div className="relative flex items-center w-full">
                        {renderIcon(leadingIcon, 16, 'text-gray-500 absolute left-[10px] dark:text-gray-300')}
                        <input
                            type={type}
                            autoComplete="off"
                            className={cn(
                                'flex items-center h-9 w-full bg-white rounded-lg border border-gray-300 px-[14px] py-2 pb-[10px] text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300',
                                'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                                'focus-visible:outline-none focus-visible:ring-4 focus:border-blue-300 focus-visible:ring-[#DCE7FE] dark:focus:border-blue-900 dark:focus:focus-visible:ring-[#2f436f58]',
                                'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700',
                                { 'pl-8': leadingIcon !== undefined },
                                { 'pr-12': trailingIcon !== undefined },
                                { 'tracking-wider': getMaskedValue?.length > 0 },
                                {
                                    ' !border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2]':
                                        isDestructive,
                                },
                                className
                            )}
                            ref={ref}
                            {...props}
                            value={getMaskedValue}
                            onPaste={e => {
                                setIsPasting(true);
                                setIsPastedValue(e.clipboardData.getData('text'));
                            }}
                            onInput={handleInput}
                        />
                        {renderIcon(trailingIcon, 16, 'text-gray-500 absolute right-[14px]')}
                    </div>
                </div>
                {supportiveText && (
                    <p
                        className={cn('text-xs font-normal', {
                            'text-red-500 dark:text-red-500': isDestructive,
                            'text-gray-500 dark:text-gray-300': !isDestructive,
                        })}
                    >
                        {supportiveText}
                    </p>
                )}
            </div>
        );
    }
);
MaskedInput.displayName = 'MaskedInput';

export { MaskedInput };
