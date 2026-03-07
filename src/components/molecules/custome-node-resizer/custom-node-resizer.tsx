import { useReactFlow, useStore, Node } from '@xyflow/react';
import { useCallback } from 'react';

interface CustomResizerProps {
    id: string;
    selected?: boolean;
    minWidth?: number;
    minHeight?: number;
}

const useNodeById = (id: string): Node | undefined => useStore(state => state.nodes.find(node => node.id === id));

export const CustomResizer = ({ id, selected, minWidth = 200, minHeight = 150 }: CustomResizerProps) => {
    const { setNodes } = useReactFlow();
    const node = useNodeById(id);

    const onResize = useCallback(
        (dx: number, dy: number) => {
            if (!node) return;

            // Get current dimensions from node style or measured
            const currentWidth = node.style?.width
                ? typeof node.style.width === 'string'
                    ? parseInt(node.style.width)
                    : node.style.width
                : node.measured?.width ?? minWidth;
            const currentHeight = node.style?.height
                ? typeof node.style.height === 'string'
                    ? parseInt(node.style.height)
                    : node.style.height
                : node.measured?.height ?? minHeight;

            const newWidth = Math.max(minWidth, currentWidth + dx);
            const newHeight = Math.max(minHeight, currentHeight + dy);

            setNodes(nds =>
                nds.map(n =>
                    n.id === id
                        ? {
                              ...n,
                              style: {
                                  ...n.style,
                                  width: newWidth,
                                  height: newHeight,
                              },
                          }
                        : n
                )
            );
        },
        [id, node, setNodes, minWidth, minHeight]
    );

    if (!selected || !node) return null;

    const handleSize = 12;

    return (
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/40 pointer-events-none z-30">
            {/* Bottom-right resize handle */}
            <div
                className="absolute w-3 h-3 bg-primary rounded-full cursor-se-resize pointer-events-auto z-40 hover:bg-primary/80 transition-colors"
                style={{
                    bottom: -handleSize / 2,
                    right: -handleSize / 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const startX = e.clientX;
                    const startY = e.clientY;
                    let lastDx = 0;
                    let lastDy = 0;

                    const onMove = (ev: MouseEvent) => {
                        ev.preventDefault();
                        const dx = ev.clientX - startX;
                        const dy = ev.clientY - startY;

                        // Only resize if there's a meaningful change
                        if (Math.abs(dx - lastDx) > 1 || Math.abs(dy - lastDy) > 1) {
                            onResize(dx - lastDx, dy - lastDy);
                            lastDx = dx;
                            lastDy = dy;
                        }
                    };

                    const onUp = (ev: MouseEvent) => {
                        ev.preventDefault();
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                    };

                    // Set cursor for the entire document during resize
                    document.body.style.cursor = 'se-resize';
                    document.body.style.userSelect = 'none';

                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            />

            {/* Optional: Add more resize handles */}
            {/* Bottom handle */}
            <div
                className="absolute w-3 h-3 bg-primary rounded-full cursor-s-resize pointer-events-auto z-40 hover:bg-primary/80 transition-colors"
                style={{
                    bottom: -handleSize / 2,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const startY = e.clientY;
                    let lastDy = 0;

                    const onMove = (ev: MouseEvent) => {
                        ev.preventDefault();
                        const dy = ev.clientY - startY;

                        if (Math.abs(dy - lastDy) > 1) {
                            onResize(0, dy - lastDy);
                            lastDy = dy;
                        }
                    };

                    const onUp = (ev: MouseEvent) => {
                        ev.preventDefault();
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                    };

                    document.body.style.cursor = 's-resize';
                    document.body.style.userSelect = 'none';

                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            />

            {/* Right handle */}
            <div
                className="absolute w-3 h-3 bg-primary rounded-full cursor-e-resize pointer-events-auto z-40 hover:bg-primary/80 transition-colors"
                style={{
                    right: -handleSize / 2,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
                onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    const startX = e.clientX;
                    let lastDx = 0;

                    const onMove = (ev: MouseEvent) => {
                        ev.preventDefault();
                        const dx = ev.clientX - startX;

                        if (Math.abs(dx - lastDx) > 1) {
                            onResize(dx - lastDx, 0);
                            lastDx = dx;
                        }
                    };

                    const onUp = (ev: MouseEvent) => {
                        ev.preventDefault();
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                    };

                    document.body.style.cursor = 'e-resize';
                    document.body.style.userSelect = 'none';

                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            />
        </div>
    );
};
