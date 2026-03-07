// useKeyboardNavigation.ts
import { useEffect } from 'react';
import type { editor, IDisposable } from 'monaco-editor';
import { IntellisenseWidgetHandle } from '@/app/workspace/[wid]/prompt-templates/components/intellisense-widget';

export function useKeyboardNavigation(
    editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>,
    showIntellisense: boolean,
    intellisenseRef: React.RefObject<IntellisenseWidgetHandle>,
    setShowIntellisense: (v: boolean) => void,
    keyboardDisposable: IDisposable | null,
    setKeyboardDisposable: (d: IDisposable | null) => void
) {
    useEffect(() => {
        if (!editorRef.current) return;
        if (keyboardDisposable) keyboardDisposable.dispose();

        if (showIntellisense) {
            const disposable = editorRef.current.onKeyDown(e => {
                switch (e.code) {
                    case 'ArrowDown':
                        intellisenseRef.current?.moveSelectionDown();
                        break;
                    case 'ArrowUp':
                        intellisenseRef.current?.moveSelectionUp();
                        break;
                    case 'Enter':
                        intellisenseRef.current?.selectCurrent();
                        break;
                    case 'Escape':
                        setShowIntellisense(false);
                        break;
                }
                e.preventDefault();
            });
            setKeyboardDisposable(disposable);
            return () => disposable.dispose();
        }
    }, [showIntellisense]);
}
