'use client';

import '@assistant-ui/react-markdown/styles/dot.css';
import {
    CodeHeaderProps,
    unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
    useIsMarkdownCodeBlock,
} from '@assistant-ui/react-markdown';
import { CheckIcon, ChevronRight, CopyIcon } from 'lucide-react';
import React, { ComponentProps, FC, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { cn } from '@/lib/utils';

import { IApiCallAction } from '@/hooks/use-chatbot';
import 'katex/dist/katex.min.css';
import { TooltipIconButton } from '../tooltip-icon-button/tooltip-icon-button';

// Use React's built-in type for code elements
type CodeProps = ComponentProps<'code'>;
type PreProps = ComponentProps<'pre'>;

const MarkdownTextImpl = ({ children, apiCallAction }: { children: string; apiCallAction?: IApiCallAction }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={getMarkdownComponents(apiCallAction)}
        >
            {children}
        </ReactMarkdown>
    );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();
    const onCopy = () => {
        if (!code || isCopied) return;
        copyToClipboard(code);
    };

    return (
        <div className="flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            <span className="lowercase [&>span]:text-xs">{language || 'code'}</span>
            <TooltipIconButton tooltip="Copy" onClick={onCopy}>
                {!isCopied && <CopyIcon size={16} />}
                {isCopied && <CheckIcon size={16} />}
            </TooltipIconButton>
        </div>
    );
};

// Custom SyntaxHighlighter component
const CodeBlock = ({ language, children, ...props }: { language: string; children: string }) => {
    return (
        <SyntaxHighlighter
            style={atomDark}
            language={language || 'text'}
            PreTag="div"
            {...props}
            className="!m-0 !bg-black !p-4 !rounded-b-lg"
        >
            {children}
        </SyntaxHighlighter>
    );
};

const useCopyToClipboard = ({
    copiedDuration = 3000,
}: {
    copiedDuration?: number;
} = {}) => {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const copyToClipboard = (value: string) => {
        if (!value) return;

        navigator.clipboard.writeText(value).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), copiedDuration);
        });
    };

    return { isCopied, copyToClipboard };
};

// Custom Pre component to handle code blocks
const Pre = ({ className, children, ...props }: PreProps) => {
    const isCodeBlock = useIsMarkdownCodeBlock();

    if (isCodeBlock) {
        return <>{children}</>;
    }

    return (
        <pre className={cn('overflow-x-auto rounded-lg bg-black p-4 text-white max-w-4xl', className)} {...props}>
            {children}
        </pre>
    );
};

// Custom Code component with syntax highlighting
const Code = ({ className, children, ...props }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match?.[1] ?? '';
    const isCodeBlock = useIsMarkdownCodeBlock();

    if (isCodeBlock && children) {
        // Make sure children is string or can be converted to string
        const codeContent =
            typeof children === 'string' ? children.replace(/\n$/, '') : String(children).replace(/\n$/, '');

        return (
            <div className="my-5 max-w-4xl">
                <CodeHeader language={language} code={codeContent} />
                <CodeBlock language={language}>{codeContent}</CodeBlock>
            </div>
        );
    }

    return (
        <code className={cn('rounded px-1 py-0.5 font-mono text-sm', 'font-semibold', className)} {...props}>
            {children}
        </code>
    );
};

const defaultComponents = memoizeMarkdownComponents({
    h1: ({ className, children, ...props }) => (
        <h1 className={cn('mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0', className)} {...props}>
            {children || '\u00A0'}
        </h1>
    ),
    h2: ({ className, children, ...props }) => (
        <h2
            className={cn(
                'mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0',
                className
            )}
            {...props}
        >
            {children || '\u00A0'}
        </h2>
    ),
    h3: ({ className, children, ...props }) => (
        <h3
            className={cn(
                'mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0',
                className
            )}
            {...props}
        >
            {children || '\u00A0'}
        </h3>
    ),
    h4: ({ className, children, ...props }) => (
        <h4
            className={cn('mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0', className)}
            {...props}
        >
            {children || '\u00A0'}
        </h4>
    ),
    h5: ({ className, children, ...props }) => (
        <h5 className={cn('my-4 text-lg font-semibold first:mt-0 last:mb-0', className)} {...props}>
            {children || '\u00A0'}
        </h5>
    ),
    h6: ({ className, children, ...props }) => (
        <h6 className={cn('my-4 font-semibold first:mt-0 last:mb-0', className)} {...props}>
            {children || '\u00A0'}
        </h6>
    ),
    p: ({ className, ...props }) => (
        <p className={cn('mt-5 text-sm leading-7 first:mt-0 last:mb-0', className)} {...props} />
    ),
    a: ({ className, href, children, ...props }) => {
        const shouldOpenInNewTab = href?.includes('target=_blank');
        const cleanHref = href?.replace(/[?&]target=_blank/, '');

        return (
            <a
                href={cleanHref}
                target={shouldOpenInNewTab ? '_blank' : undefined}
                rel={shouldOpenInNewTab ? 'noopener noreferrer' : undefined}
                className={cn('text-primary font-medium underline underline-offset-4 link', className)}
                {...props}
            >
                {children || cleanHref || '\u00A0'}
            </a>
        );
    },
    blockquote: ({ className, ...props }) => (
        <blockquote className={cn('border-l-2 pl-6 italic', className)} {...props} />
    ),
    ul: ({ className, ...props }) => <ul className={cn('my-5 ml-6 list-disc [&>li]:mt-2', className)} {...props} />,
    ol: ({ className, ...props }) => <ol className={cn('my-5 ml-6 list-decimal [&>li]:mt-2', className)} {...props} />,
    hr: ({ className, ...props }) => <hr className={cn('my-5 border-b dark:border-gray-700', className)} {...props} />,

    // Enhanced table components for better styling
    table: ({ className, children, ...props }) => (
        <div className="my-6 w-full overflow-y-auto rounded-lg border border-gray-200 shadow dark:border-gray-600">
            <table
                className={cn('w-full border-collapse rounded-lg bg-white text-sm', 'dark:bg-gray-900', className)}
                {...props}
            >
                {children}
            </table>
        </div>
    ),
    thead: ({ className, ...props }) => (
        <thead
            className={cn('bg-gray-100 border-b border-b-gray-300 dark:bg-gray-900 dark:border-b-gray-800', className)}
            {...props}
        />
    ),
    th: ({ className, ...props }) => (
        <th
            className={cn(
                'bg-gray-100 px-6 py-3 text-left font-medium text-gray-700 uppercase tracking-wider border-b border-r last:border-r-0 text-xs',
                '[&[align=center]]:text-center [&[align=right]]:text-right',
                'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:border-b dark:border-b-gray-700 dark:border-r-gray-700',
                className
            )}
            {...props}
        />
    ),
    td: ({ className, ...props }) => (
        <td
            className={cn(
                'px-6 py-4 border-r last:border-r-0 whitespace-nowrap',
                'dark:text-gray-200',
                '[&[align=center]]:text-center [&[align=right]]:text-right',
                className
            )}
            {...props}
        />
    ),
    tr: ({ className, ...props }) => (
        <tr
            className={cn(
                'border-b border-gray-300 transition-colors dark:border-gray-800',
                '[&:not(thead_*)]:hover:bg-gray-50 transition-colors',
                '[&:not(thead_*)]:dark:hover:bg-gray-800',
                className
            )}
            {...props}
        />
    ),
    tbody: ({ className, ...props }) => <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />,
    sup: ({ className, ...props }) => <sup className={cn('[&>a]:text-xs [&>a]:no-underline', className)} {...props} />,
    pre: Pre,
    code: Code,
    CodeHeader,
    details: ({ className, children, ...props }) => {
        let summary: React.ReactNode = null;
        const content: React.ReactNode[] = [];

        React.Children.forEach(children, child => {
            if (React.isValidElement(child) && child.type === 'summary') {
                summary = child;
            } else {
                content.push(child);
            }
        });

        return (
            <details
                className={cn(
                    'group my-4 w-full rounded-md border transition-all',
                    'border-gray-300 dark:border-gray-600',
                    'open:border-blue-500 open:ring-2 open:ring-blue-100 dark:open:ring-blue-400/30',
                    className
                )}
                {...props}
            >
                <summary
                    className={cn(
                        'flex items-center justify-between cursor-pointer select-none px-4 py-2',
                        'text-sm font-medium text-gray-800 dark:text-gray-100',
                        'hover:bg-gray-50 dark:hover:bg-gray-800',
                        'transition-colors',
                        '[&::-webkit-details-marker]:hidden list-none' // hides ::marker in all browsers
                    )}
                >
                    <div className="mr-2">{summary}</div>
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="px-4 pb-4 pt-2">
                    <MarkdownText>{React.Children.toArray(content).join('')}</MarkdownText>
                </div>
            </details>
        );
    },
});

const getMarkdownComponents = (apiCallAction: IApiCallAction | undefined) => {
    return {
        ...defaultComponents,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        button: (props: any) => {
            const { className } = props;
            const buttonId = props['data-button-id'] as string | undefined;
            const action = props['data-action'] as string | undefined;

            const handleClick = () => {
                if (action && action === 'true') {
                    const api = apiCallAction?.apiConfigs?.find(x => x.buttonId === buttonId);
                    if (api) {
                        apiCallAction?.buttonCallback(api);
                    }
                }
            };

            const buttonProps = Object.fromEntries(Object.entries(props).filter(([k]) => k !== 'node'));
            return (
                <button
                    {...buttonProps}
                    onClick={handleClick}
                    className={cn(
                        'w-max antialiased cursor-pointer disabled:cursor-auto inline-flex justify-center items-center gap-x-2 rounded-lg font-semibold transition-all duration-50 ease-in-out border drop-shadow-sm outline-none focus:ring-2 focus:outline-none h-9 px-[14px] py-2 text-sm',
                        className
                    )}
                >
                    {props.children}
                </button>
            );
        },
    };
};
