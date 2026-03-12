import { useCallback, useRef, useState } from 'react';
import { Node as FlowNode, Edge } from '@xyflow/react';

export interface HistoryState {
    nodes: FlowNode[];
    edges: Edge[];
}

interface UseUndoRedoOptions {
    maxHistorySize?: number;
}

interface UseUndoRedoReturn {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => HistoryState | null;
    redo: () => HistoryState | null;
    takeSnapshot: (nodes: FlowNode[], edges: Edge[]) => void;
    clearHistory: () => void;
    pushToRedo: (nodes: FlowNode[], edges: Edge[]) => void;
    pushToUndo: (nodes: FlowNode[], edges: Edge[]) => void;
}

/**
 * Custom hook for undo/redo functionality in the workflow editor.
 * Maintains history stacks for nodes and edges state changes.
 */
export const useUndoRedo = (options: UseUndoRedoOptions = {}): UseUndoRedoReturn => {
    const { maxHistorySize = 50 } = options;

    // Use refs for history stacks to avoid re-renders on every change
    const undoStackRef = useRef<HistoryState[]>([]);
    const redoStackRef = useRef<HistoryState[]>([]);

    // State to trigger re-renders when undo/redo availability changes
    const [, forceUpdate] = useState({});

    const canUndo = undoStackRef.current.length > 0;
    const canRedo = redoStackRef.current.length > 0;

    /**
     * Takes a snapshot of the current state and adds it to the undo stack.
     * Clears the redo stack since new changes invalidate redo history.
     */
    const takeSnapshot = useCallback(
        (nodes: FlowNode[], edges: Edge[]) => {
            const snapshot: HistoryState = {
                nodes: structuredClone(nodes),
                edges: structuredClone(edges),
            };

            undoStackRef.current = [...undoStackRef.current, snapshot];

            // Limit history size
            if (undoStackRef.current.length > maxHistorySize) {
                undoStackRef.current = undoStackRef.current.slice(-maxHistorySize);
            }

            // Clear redo stack when a new action is taken
            redoStackRef.current = [];

            forceUpdate({});
        },
        [maxHistorySize]
    );

    /**
     * Restores the previous state from the undo stack.
     * Moves the current state to the redo stack.
     */
    const undo = useCallback((): HistoryState | null => {
        if (undoStackRef.current.length === 0) {
            return null;
        }

        const previousState = undoStackRef.current[undoStackRef.current.length - 1];
        undoStackRef.current = undoStackRef.current.slice(0, -1);

        forceUpdate({});
        return previousState;
    }, []);

    /**
     * Restores the next state from the redo stack.
     * Moves the current state to the undo stack.
     */
    const redo = useCallback((): HistoryState | null => {
        if (redoStackRef.current.length === 0) {
            return null;
        }

        const nextState = redoStackRef.current[redoStackRef.current.length - 1];
        redoStackRef.current = redoStackRef.current.slice(0, -1);

        forceUpdate({});
        return nextState;
    }, []);

    /**
     * Pushes the current state to redo stack (used during undo operation)
     */
    const pushToRedo = useCallback((nodes: FlowNode[], edges: Edge[]) => {
        const snapshot: HistoryState = {
            nodes: structuredClone(nodes),
            edges: structuredClone(edges),
        };
        redoStackRef.current = [...redoStackRef.current, snapshot];
        forceUpdate({});
    }, []);

    /**
     * Pushes the current state to undo stack (used during redo operation)
     */
    const pushToUndo = useCallback((nodes: FlowNode[], edges: Edge[]) => {
        const snapshot: HistoryState = {
            nodes: structuredClone(nodes),
            edges: structuredClone(edges),
        };
        undoStackRef.current = [...undoStackRef.current, snapshot];
        forceUpdate({});
    }, []);

    /**
     * Clears both undo and redo stacks.
     */
    const clearHistory = useCallback(() => {
        undoStackRef.current = [];
        redoStackRef.current = [];
        forceUpdate({});
    }, []);

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        takeSnapshot,
        clearHistory,
        pushToRedo,
        pushToUndo,
    };
};

export default useUndoRedo;
