type ExecutionStepTimelineMarkerProps = {
    stepNumber: number;
    isLast: boolean;
};

export const ExecutionStepTimelineMarker = ({ stepNumber, isLast }: ExecutionStepTimelineMarkerProps) => {
    return (
        <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center z-10">
                <span className="text-xs font-bold text-blue-700">{stepNumber}</span>
            </div>
            {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
        </div>
    );
};
