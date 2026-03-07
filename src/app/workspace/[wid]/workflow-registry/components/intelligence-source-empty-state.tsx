import React, { useState } from 'react';
import { Button } from '@/components';
import { IntelligenceSourceForm } from '@/components/organisms';
import { IPlatformSettingData } from '@/models';

interface IntelligenceSourceEmptyStateProps {
    onChange?: (value?: IPlatformSettingData) => void;
}

export const IntelligenceSourceEmptyState = ({ onChange }: IntelligenceSourceEmptyStateProps) => {
    const [openIntelligenceForm, setOpenIntelligenceForm] = useState<boolean>(false);

    return (
        <>
            <div className="z-10 absolute border w-full h-full rounded-sm overflow-clip flex items-center justify-center flex-col">
                <div className="flex flex-col items-center gap-y-2">
                    <i className="ri-error-warning-fill text-blue-600 text-[75px]" />
                    <p className="max-w-[85%] text-center text-sm text-gray-700 dark:text-gray-400">
                        It appears that no intelligence source has been configured for this workspace. Configure one to
                        see what has changed.
                    </p>
                    <Button
                        size="sm"
                        variant="link"
                        onClick={() => {
                            setOpenIntelligenceForm(true);
                        }}
                    >
                        Configure Intelligence Source
                    </Button>
                </div>
            </div>
            {/* workspace level intelligence source picket */}
            <IntelligenceSourceForm
                isOpen={openIntelligenceForm}
                setOpen={setOpenIntelligenceForm}
                onChange={onChange}
            />
        </>
    );
};
