'use client';
import React, { useEffect, useState } from 'react';
import Activity, { ActivityProps } from './activity';
import Image from 'next/image';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
    data: ActivityProps[];
    bottomRef?: React.Ref<HTMLDivElement>;
    activityBodyHeight?: number;
}

const generateEmtpyState = (data: ActivityProps[]) => {
    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center gap-y-3 mt-16">
                <Image src="/png/empty-state.png" width={100} height={100} alt="Empty state" className="opacity-80" />
                <div className="flex flex-col w-full items-center gap-y-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-400">No Recent Activities Yet</p>
                    <p className="text-xs text-gray-700 dark:text-gray-400 w-[80%] text-center">
                        {`Looks like things are a bit quiet here. Once there’re activities, you’ll see updates in this section.`}
                    </p>
                </div>
            </div>
        );
    }

    if (data.length < 5) {
        return (
            <div className="flex flex-col items-center gap-y-3">
                <Image src="/png/empty-state.png" width={100} height={100} alt="Empty state" className="opacity-80" />
                <div className="flex flex-col w-full items-center gap-y-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-400">Few Activities So Far</p>
                    <p className="text-xs text-gray-700 dark:text-gray-400 w-[80%] text-center">
                        {`You're just getting started! As more activities happen, this section will fill
                                        up with updates`}
                    </p>
                </div>
            </div>
        );
    }

    if (data.length >= 5) {
        return null;
    }
};

const ActivityFeed = ({ data, bottomRef, activityBodyHeight }: ActivityFeedProps) => {
    const [trackHeight, setTrackHeight] = useState<number>(0);
    const { isMobile } = useBreakpoint();

    useEffect(() => {
        /**
         * Selects all <div> elements with the class 'single_activity' and calculates
         * the total height of these elements, as well as the height of a track that
         * includes spacing between them but excludes the last element’s height.
         */

        // Get all div elements with the class 'single_activity'
        const divs = document.querySelectorAll('.single_activity');

        /**
         * Calculates the total height of all elements with the class 'single_activity'.
         *
         * @type {number}
         * @description Iterates over all selected div elements and sums up their clientHeight.
         */
        const totalHeight = Array.from(divs).reduce((sum, div) => sum + div.clientHeight, 0);

        /**
         * Calculates the height of the track, considering gaps between elements
         * but excluding the last element's height.
         *
         * @type {number}
         * @description
         * - `(divs.length - 1) * 36`: Adds a gap of 36px between each pair of elements.
         * - `+ totalHeight`: Adds the sum of all div heights.
         * - `- divs[divs.length - 1].clientHeight`: Removes the height of the last div.
         */
        const calculatedTrackHeight = (divs.length - 1) * 36 + totalHeight - divs[divs.length - 1]?.clientHeight;
        setTrackHeight(calculatedTrackHeight);
    }, [data]);

    return (
        <div
            className={cn('activity-container border border-gray-200 shadow-sm rounded-lg dark:border-gray-800', {
                'w-[448px] ': !isMobile,
                'w-[98vw]': isMobile,
            })}
        >
            <div className="activity-container-header bg-[rgba(255,255,255,0.6)] px-6 h-[52px] flex items-center backdrop-blur-[7px] rounded-t-lg border-b border-b-gray-300 dark:bg-[rgba(31,41,55,0.8)] dark:backdrop-blur-[7px] dark:border-b-gray-700">
                <p className="text-md font-medium text-gray-800 dark:text-white">Recent Activities</p>
            </div>
            <div
                style={{ height: activityBodyHeight ? `${activityBodyHeight}px` : 'calc(100vh - 212px)' }}
                className="activity-feed-container bg-white rounded-b-lg dark:bg-[#1F2937]"
            >
                <div className="relative activity-feed h-full px-3 py-4 flex flex-col gap-y-9 overflow-y-scroll mb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500">
                    <div
                        style={{ height: `${trackHeight}px` }}
                        className="activity-track w-[2px] border-r border-r-gray-400 absolute border-dashed left-[23px] top-5 z-10"
                    />
                    {data.map((activity) => (
                        <Activity key={`${activity.title}-${activity.date}`} {...activity} />
                    ))}
                    <div className="empty-state-message w-full flex justify-center mt-16">
                        {generateEmtpyState(data)}
                    </div>

                    {/* Sentinel element for triggering infinite scroll */}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;
