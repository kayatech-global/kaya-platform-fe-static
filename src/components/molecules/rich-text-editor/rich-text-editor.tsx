'use-client';

import { Editor } from '@tinymce/tinymce-react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import './style.css';
import { useEffect, useState, useRef } from 'react';
import { LoadingPlaceholder } from '@/components';

interface TinyMCEEditorProps {
    value: string;
    onChange: (content: string) => void;
    height?: number;
    isDestructive?: boolean;
    supportiveText?: string;
    supportMarkdown?: boolean;
}

export default function TinyMCEEditor({
    value,
    onChange,
    height = 400,
    isDestructive = false,
    supportiveText,
    supportMarkdown = false,
}: Readonly<TinyMCEEditorProps>) {
    const turndownService = new TurndownService();
    const isInternalChange = useRef(false);

    const convertMarkdownToHtml = (md: string) => marked.parse(md, { async: false }) as string;
    const convertHtmlToMarkdown = (html: string) => turndownService.turndown(html);

    const initialHtml = supportMarkdown ? convertMarkdownToHtml(value) : value;

    const [htmlValue, setHtmlValue] = useState<string>(initialHtml);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Detect dark mode
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsDarkMode(document.documentElement.classList.contains('dark'));

            // Watch for theme changes
            const observer = new MutationObserver(() => {
                setIsDarkMode(document.documentElement.classList.contains('dark'));
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'],
            });

            return () => observer.disconnect();
        }
    }, []);

    // Sync external updates only
    useEffect(() => {
        // Skip if this change came from the editor itself
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }

        if (supportMarkdown) {
            setHtmlValue(convertMarkdownToHtml(value));
        } else {
            setHtmlValue(value);
        }
    }, [value, supportMarkdown]);

    const handleEditorChange = (html: string) => {
        setHtmlValue(html);
        isInternalChange.current = true;

        if (supportMarkdown) {
            const md = convertHtmlToMarkdown(html);
            onChange(md);
        } else {
            onChange(html);
        }
    };

    return (
        <>
            {loading && <LoadingPlaceholder text="Getting the editor ready..." className="h-[150px]" />}

            <div
                className={(() => {
                    if (loading) return 'invisible';
                    if (isDestructive) return 'editor-danger';
                    return '';
                })()}
            >
                <Editor
                    key={isDarkMode ? 'dark' : 'light'}
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    value={htmlValue}
                    onEditorChange={handleEditorChange}
                    onInit={() => setLoading(false)}
                    init={{
                        license_key: 'gpl',
                        height,
                        menubar: false,
                        plugins: ['autolink lists link image preview anchor', 'code fullscreen', 'media table paste'],
                        toolbar: 'H1 H2 H3 | bold italic | undo redo',
                        statusbar: false,
                        skin: isDarkMode ? 'oxide-dark' : 'oxide',
                        content_css: isDarkMode ? 'dark' : 'default',
                    }}
                />
                {supportiveText && <p className="text-red-500 text-sm mt-1">{supportiveText}</p>}
            </div>
        </>
    );
}
