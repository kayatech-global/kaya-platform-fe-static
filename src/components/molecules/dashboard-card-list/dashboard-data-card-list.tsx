import { Carousel, CarouselContent, CarouselItem } from '@/components/atoms/carousel';
import DashboardDataCard, { DashboardDataCardProps } from '@/components/atoms/dashboard-data-card';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import React from 'react';

interface DashboardDataCardListProps {
    data: DashboardDataCardProps[];
    classNames?: string;
}

const DashboardDataCardList = ({ data, classNames }: DashboardDataCardListProps) => {
    const { isSm, isMobile } = useBreakpoint();

    // show carousel if screen size is small else show list
    return (
        <React.Fragment>
            {isSm || isMobile ? (
                <Carousel
                    opts={{
                        align: 'start',
                    }}
                >
                    <CarouselContent>
                        {data.map((item) => (
                            <CarouselItem key={`${String(item.title)}-${String(item.value)}`}>
                                <DashboardDataCard key={`${String(item.title)}-${String(item.value)}`} {...item} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            ) : (
                <div className={cn('dashboard-data-card-list w-full flex justify-between gap-2', classNames)}>
                    {data.map((item) => (
                        <DashboardDataCard key={`${String(item.title)}-${String(item.value)}`} {...item} />
                    ))}
                </div>
            )}
        </React.Fragment>
    );
};

export default DashboardDataCardList;
