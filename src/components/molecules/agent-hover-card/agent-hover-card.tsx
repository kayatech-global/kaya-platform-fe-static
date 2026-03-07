/* eslint-disable @typescript-eslint/no-explicit-any */
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import { VoiceAgent } from '@/components/organisms/workflow-editor-form/voice-agent-form';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AgentHoverCardHeader } from './agent-hover-card-header';
import { AgentHoverCardLanModel } from './agent-hover-card-lan-models';
import { AgentHoverCardPrompt } from './agent-hover-card-prompt';
import { AgentHoverCardAPI } from './agent-hover-card-api';
import { AgentHoverCardMCP } from './agent-hover-card-mcp';
import { AgentHoverCardWrapper } from './agent-hover-card-wrapper';
import { AgentHoverCardRags } from './agent-hover-card-rags';
import { AgentHoverCardSelfLearning } from './agent-hover-card-self-learning';
import { AgentHoverCardKnowledgeGraph } from './agent-hover-card-knowledge-graph';
import { AgentHoverCardHumanInput } from './agent-hover-card-human-input';
import { AgentHoverCardOutputBroadcasting } from './agent-hover-card-output-broadcasting';
import { AgentHoverCardGuardrail } from './agent-hover-card-guardrail';
import { AgentHoverCardConnectors } from './agent-hover-card-connectors';
import { AgentHoverCardExecutableFunctions } from './agent-hover-card-executable-functions';
import { CustomNodeTypes } from '@/enums';
import { PlannerReplannerAgent } from '@/components/organisms/workflow-editor-form/planner-replanner-form';
import { AgentHoverCardDeterministicExecution } from './agent-hover-card-deterministic-execution';
import { AgentHoverCardMaxReplanAttempt } from './agent-hover-card-max-replan-attempt';

// Portal component that will render content at the document body level
interface PortalProps {
    children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
    const [portalNode, setPortalNode] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        // Create a div element that will serve as our portal container
        const div = document.createElement('div');

        // Add it to the document body
        document.body.appendChild(div);
        setPortalNode(div);

        // Clean up function to remove the div when component unmounts
        return () => {
            document.body.removeChild(div);
        };
    }, []);

    // Only render the portal when the div has been created
    return portalNode ? createPortal(children, portalNode) : null;
};

interface AgentHoverCardProps {
    data: AgentType | VoiceAgent | PlannerReplannerAgent | null;
    color: string;
    hideApi?: boolean;
    type?: string;
}

export const AgentHoverCard: React.FC<AgentHoverCardProps> = ({ data, color, hideApi, type }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [cardHeight, setCardHeight] = useState<number>(0);
    const [cardWidth, setCardWidth] = useState<number>(0);
    const circleAlertRef = useRef<SVGSVGElement | null>(null);
    const portalContentRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Clear any existing timeout
    const clearHoverTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Set hover state with optional delay
    const setHoverWithDelay = (hovered: boolean, delay: number = 0) => {
        clearHoverTimeout();
        if (delay > 0) {
            timeoutRef.current = setTimeout(() => {
                setIsHovered(hovered);
            }, delay);
        } else {
            setIsHovered(hovered);
        }
    };

    // Function to calculate position based on CircleAlert icon's current position
    const calculatePosition = () => {
        if (circleAlertRef.current) {
            const rect = circleAlertRef.current.getBoundingClientRect();
            if (rect) {
                let calculatedTop = rect.top + window.scrollY;
                let calculatedLeft = rect.right + window.scrollX + 16; // 16px gap from the icon
                const margin = 16;

                // If cardHeight is known, check if it would overflow the viewport
                if (cardHeight && calculatedTop + cardHeight > window.innerHeight - margin) {
                    // Place the card above the icon, with a small margin
                    calculatedTop = rect.bottom + window.scrollY - cardHeight;
                    // If still offscreen, clamp to margin from top
                    if (calculatedTop < margin) calculatedTop = margin;
                }

                // If cardWidth is known, check if it would overflow the right viewport edge
                if (cardWidth && calculatedLeft + cardWidth > window.innerWidth - margin) {
                    // Try to place to the left of the icon
                    calculatedLeft = rect.left + window.scrollX - cardWidth - margin;
                    // If still offscreen, clamp to margin from left
                    if (calculatedLeft < margin) calculatedLeft = margin;
                }

                setPosition({
                    top: calculatedTop,
                    left: calculatedLeft,
                });
            }
        }
    };

    useEffect(() => {
        // Add event listeners to the CircleAlert icon
        const currentElement = circleAlertRef.current;
        if (currentElement) {
            const handleMouseEnter = () => {
                // Calculate position every time the portal is about to open
                calculatePosition();
                setHoverWithDelay(true);
            };

            const handleMouseLeave = () => {
                setHoverWithDelay(false, 150);
            };

            currentElement.addEventListener('mouseenter', handleMouseEnter);
            currentElement.addEventListener('mouseleave', handleMouseLeave);

            // Add resize/scroll listeners for when portal is open
            const handleResizeOrScroll = () => {
                if (isHovered) {
                    calculatePosition();
                }
            };

            window.addEventListener('resize', handleResizeOrScroll);
            window.addEventListener('scroll', handleResizeOrScroll);

            return () => {
                currentElement.removeEventListener('mouseenter', handleMouseEnter);
                currentElement.removeEventListener('mouseleave', handleMouseLeave);
                window.removeEventListener('resize', handleResizeOrScroll);
                window.removeEventListener('scroll', handleResizeOrScroll);
            };
        }
    }, [cardHeight, cardWidth, isHovered]);

    // Recalculate position whenever the portal opens
    useEffect(() => {
        if (isHovered) {
            calculatePosition();
        }
    }, [isHovered, cardHeight, cardWidth]);

    // Handle portal content hover - using a different approach
    const handlePortalRef = (el: HTMLDivElement | null) => {
        portalContentRef.current = el;
        if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.height !== cardHeight) setCardHeight(rect.height);
            if (rect.width !== cardWidth) setCardWidth(rect.width);

            // Add event listeners directly when the element is created
            const handlePortalMouseEnter = () => {
                setHoverWithDelay(true);
            };

            const handlePortalMouseLeave = () => {
                setHoverWithDelay(false, 150);
            };

            el.addEventListener('mouseenter', handlePortalMouseEnter);
            el.addEventListener('mouseleave', handlePortalMouseLeave);

            // Store cleanup function on the element
            (el as any)._cleanup = () => {
                el.removeEventListener('mouseenter', handlePortalMouseEnter);
                el.removeEventListener('mouseleave', handlePortalMouseLeave);
            };
        }
    };

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            if (portalContentRef.current && (portalContentRef.current as any)._cleanup) {
                (portalContentRef.current as any)._cleanup();
            }
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, []);

    return (
        <>
            <CircleAlert
                ref={circleAlertRef}
                absoluteStrokeWidth={false}
                color={color}
                className={cn('absolute h-5 w-5 top-[4px] left-[92px] pointer-events-auto stroke-2 cursor-pointer')}
            />

            {isHovered && (
                <Portal>
                    <AgentHoverCardWrapper handlePortalRef={handlePortalRef} position={position}>
                        <AgentHoverCardHeader data={data} />
                        <div className="agent-hover-card-inner-content max-h-[80vh] pr-1 overflow-y-auto [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                            <AgentHoverCardLanModel data={data} />
                            <AgentHoverCardPrompt data={data} />
                            {type !== CustomNodeTypes.plannerNode && type !== CustomNodeTypes.rePlannerNode && (
                                <>
                                    <AgentHoverCardHumanInput data={data} />
                                    <AgentHoverCardAPI data={data} hideApi={hideApi} />
                                    <AgentHoverCardMCP data={data} />
                                    <AgentHoverCardRags data={data} />
                                    <AgentHoverCardKnowledgeGraph data={data} />
                                    <AgentHoverCardConnectors data={data} />
                                    <AgentHoverCardExecutableFunctions data={data} />
                                </>
                            )}
                            <AgentHoverCardGuardrail data={data} />
                            {type !== CustomNodeTypes.plannerNode && type !== CustomNodeTypes.rePlannerNode && (
                                <>
                                    <AgentHoverCardSelfLearning data={data} />
                                    <AgentHoverCardOutputBroadcasting data={data} />
                                </>
                            )}
                            {type === CustomNodeTypes.plannerNode && (
                                <AgentHoverCardDeterministicExecution data={data} />
                            )}
                            {type === CustomNodeTypes.rePlannerNode && <AgentHoverCardMaxReplanAttempt data={data} />}
                        </div>
                    </AgentHoverCardWrapper>
                </Portal>
            )}
        </>
    );
};
