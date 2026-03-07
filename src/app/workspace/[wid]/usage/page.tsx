import React from 'react';
import UsageContainer from './components/usage-container';
import './page.css';

const Page = () => {
    return (
        <div className="usage-page pb-4 max-w-[1280px] mx-auto" data-testid="usage-page">
            <div className="flex justify-between gap-x-9">
                <div className="dashboard-left-section flex flex-col gap-y-9 w-full">
                    <UsageContainer />
                </div>
            </div>
        </div>
    );
};

export default Page;
