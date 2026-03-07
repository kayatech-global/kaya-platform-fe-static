import { Edge, Node } from '@xyflow/react';
import { isEqual, pick } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface IUseWorkflowDirtyState {
    initialSnapshot: {
        nodes: Node[];
        edges: Edge[];
    } | null;
    nodes?: Node[];
    edges?: Edge[];
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

export const useWorkflowDirtyState = ({ initialSnapshot, nodes, edges }: IUseWorkflowDirtyState) => {
    const [hasChanges, setHasChanges] = useState(false);
    const lastSnapshotRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(initialSnapshot);

    useEffect(() => {
        if (initialSnapshot) {
            lastSnapshotRef.current = initialSnapshot;
        }

        const prevSnapshot = lastSnapshotRef.current;

        const normalizedNodes = normalizeNodes(nodes);
        const prevNormalizedNodes = normalizeNodes(prevSnapshot?.nodes ?? []);
        const normalizedEdges = normalizeEdges(edges);
        const prevNormalizedEdges = normalizeEdges(prevSnapshot?.edges ?? []);

        if (!prevSnapshot) {
            setHasChanges(normalizedNodes.length > 0 || normalizedEdges.length > 0);
            return;
        }

        const nodesEqual = isEqual(normalizedNodes, prevNormalizedNodes);
        const edgesEqual = isEqual(normalizedEdges, prevNormalizedEdges);
        setHasChanges(!(nodesEqual && edgesEqual));
    }, [nodes, edges, initialSnapshot]);

    return { hasChanges, setHasChanges, lastSnapshotRef };
};
