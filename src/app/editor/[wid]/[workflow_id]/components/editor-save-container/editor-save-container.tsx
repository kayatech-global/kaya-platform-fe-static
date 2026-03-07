'use client';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { IWorkflowVisualGraph } from '@/models';
import { cn } from '@/lib/utils';
import { Edge, Node } from '@xyflow/react';
import { isEqual, pick } from 'lodash';
import { LoaderCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface IEditorSaveContainerProps {
    handleSave: () => Promise<void>;
    isReadOnly?: boolean;
    isLoading: boolean;
    nodes?: Node[];
    edges?: Edge[];
    initialSnapshot: {
        nodes: Node[];
        edges: Edge[];
    } | null;
    hasChanges: boolean;
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

// Only keep relevant fields for comparison
const filterNodeForComparison = (node: Node) => pick(node, ['id', 'data', 'measured', 'position', 'type']);

const normalizeNodes = (nodes: Node[] = []) =>
    nodes.map(n => ({
        ...filterNodeForComparison(n),
        // Optional: round positions to avoid floating-point drift
        position: {
            x: Math.round(n.position.x * 1000) / 1000,
            y: Math.round(n.position.y * 1000) / 1000,
        },
    }));

/**
 * Only include stable properties for edges
 * Ignore transient ones like selected or interaction flags.
 */
const filterEdgeForComparison = (edge: Edge) =>
    pick(edge, ['id', 'source', 'target', 'sourceHandle', 'targetHandle', 'type', 'data', 'label']);

const normalizeEdges = (edges: Edge[] = []) => edges.map(e => filterEdgeForComparison(e));

export const EditorSaveContainer = ({
    handleSave,
    isLoading,
    isReadOnly,
    nodes = [],
    edges = [],
    initialSnapshot,
    hasChanges,
    setHasChanges,
}: IEditorSaveContainerProps) => {
    const [lastSnapshot, setLastSnapshot] = useState<IWorkflowVisualGraph | null>(initialSnapshot);

    useEffect(() => {
        if (initialSnapshot) {
            setLastSnapshot(initialSnapshot);
        }

        const normalizedNodes = normalizeNodes(nodes);
        const prevNormalizedNodes = normalizeNodes(lastSnapshot?.nodes || []);
        const normalizedEdges = normalizeEdges(edges);
        const prevNormalizedEdges = normalizeEdges(lastSnapshot?.edges || []);

        if (!lastSnapshot) {
            setHasChanges(normalizedNodes.length > 0 || normalizedEdges.length > 0);
            return;
        }

        const nodesEqual = isEqual(normalizedNodes, prevNormalizedNodes);
        const edgesEqual = isEqual(normalizedEdges, prevNormalizedEdges);
        setHasChanges(!(nodesEqual && edgesEqual));
    }, [nodes, edges, initialSnapshot, setLastSnapshot]);

    const handleClick = async () => {
        await handleSave();
        setLastSnapshot({ nodes, edges });
        setHasChanges(false);
    };

    const isDisabled = isLoading || isReadOnly || !hasChanges;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        className={cn('rounded flex items-center px-2 py-1 gap-x-2', {
                            'bg-blue-600 border border-blue-600': !isDisabled,
                            'bg-gray-400 border-gray-400 opacity-60 cursor-not-allowed': isDisabled,
                        })}
                        disabled={isDisabled}
                        onClick={handleClick}
                    >
                        {isLoading ? (
                            <LoaderCircle className="animate-spin text-white" size={16} />
                        ) : (
                            <i className="ri-save-line text-xs text-white" />
                        )}
                        <p className="text-xs font-semibold text-white">Save</p>
                    </button>
                </TooltipTrigger>
                {isReadOnly && (
                    <TooltipContent side="right" align="center">
                        You do not have permission to save this workflow.
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};
