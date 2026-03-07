'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import { useReactFlow, NodeResizer, Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { NodeListModalBody } from '../node-list-modal-body/node-list-modal-body';
import { generateNodeId, getNodeLabel } from '@/app/editor/[wid]/[workflow_id]/components/editor-playground';
import { useState } from 'react';
import { useDnD } from '@/context';
import { CustomNodeTypes } from '@/enums';

interface GroupNodeProps {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    selected?: boolean;
    allowedNodes?: CustomNodeTypes[];
}

export const IteratorNode = ({ id, data, selected, allowedNodes }: GroupNodeProps) => {
    const { setNodes } = useReactFlow();
    const [open, setOpen] = useState(false);
    const { setSelectedNodeId, selectedNodeId } = useDnD();

    const addChildToGroup = (nodeType: CustomNodeTypes) => {
        const newChildNode = {
            id: generateNodeId(nodeType),
            data: { label: getNodeLabel(nodeType) },
            position: { x: Math.random() * 200 + 20, y: Math.random() * 120 + 40 },
            parentId: id,
            extent: 'parent' as const,
            type: nodeType,
        };

        setNodes(nds => nds.concat(newChildNode));
        setOpen(false);
    };

    return (
        <>
            {/* Custom styles for NodeResizer */}
            <style jsx>{`
                .react-flow__resize-control.line {
                    border-radius: 16px !important;
                }
                .react-flow__resize-control.line.top {
                    border-top-left-radius: 16px !important;
                    border-top-right-radius: 16px !important;
                    border-bottom-left-radius: 0 !important;
                    border-bottom-right-radius: 0 !important;
                }
                .react-flow__resize-control.line.bottom {
                    border-top-left-radius: 0 !important;
                    border-top-right-radius: 0 !important;
                    border-bottom-left-radius: 16px !important;
                    border-bottom-right-radius: 16px !important;
                }
                .react-flow__resize-control.line.left {
                    border-top-left-radius: 16px !important;
                    border-top-right-radius: 0 !important;
                    border-bottom-left-radius: 16px !important;
                    border-bottom-right-radius: 0 !important;
                }
                .react-flow__resize-control.line.right {
                    border-top-left-radius: 0 !important;
                    border-top-right-radius: 16px !important;
                    border-bottom-left-radius: 0 !important;
                    border-bottom-right-radius: 16px !important;
                }
            `}</style>

            <div
                className={`
                    relative w-full h-full bg-[rgba(59,122,247,0.2)] 
                    dark:bg-gray-800/30 shadow-md transition-all duration-200
                    ${
                        selected
                            ? 'border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                            : 'border border-blue-500 hover:border-blue-500/80'
                    }
                `}
                onClick={() => setSelectedNodeId(id)} // Select node on click
            >
                {/* Enhanced NodeResizer with better visual design */}
                <NodeResizer
                    isVisible={selected}
                    minWidth={300}
                    minHeight={200}
                    handleClassName="!bg-blue-300 !border-1 !border-white !rounded-full hover:!bg-blue-600 !shadow-lg transition-all duration-200 !z-20"
                    lineClassName="!border-blue-400 !border-1 !border-dashed !opacity-70"
                />

                {/* Enhanced Handles */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white !shadow-md hover:!bg-blue-600 transition-all duration-200"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white !shadow-md hover:!bg-blue-600 transition-all duration-200"
                />

                {/* Enhanced Group label */}
                <div className="absolute flex items-center justify-between bg-blue-500 w-[calc(100%+2px)] -top-6 -left-[1px] rounded-[4px_4px_0_0] pl-3 pr-4 py-2 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                    <div className="flex items-center gap-x-1">
                        <i className="ri-repeat-one-fill text-lg text-white" />
                        <p className="text-md font-medium text-gray-100">
                            {`Iterator ${data.name ? '|' : ''} ${data.name ?? ''}` || 'Iterator'}
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger>
                            <div
                                title="Add Nodes"
                                className="cursor-pointer p-1 rounded-lg bg-blue-700 hover:bg-blue-800 transition-all duration-100"
                            >
                                <Plus size={20} className="text-gray-100 font-bold" />
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Select Nodes</DialogTitle>
                                <DialogDescription>
                                    <NodeListModalBody allowedNodes={allowedNodes} addChildToGroup={addChildToGroup} />
                                </DialogDescription>
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Selection indicator */}
                {selectedNodeId === id && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl opacity-10 animate-pulse animate-once -z-10 duration-700" />
                )}
            </div>
        </>
    );
};
