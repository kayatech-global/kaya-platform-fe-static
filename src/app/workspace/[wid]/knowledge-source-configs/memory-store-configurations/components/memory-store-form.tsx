import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn } from '@/lib/utils';
import { Database } from 'lucide-react';
import React from 'react';
import { FormBody } from './form-body';
import { DatabaseType } from './memory-store-container';

interface DatabasesFormProp {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    isFetching: boolean;
    databaseData: DatabaseType[];
}

export const MemoryStoreForm = ({ isOpen, setIsOpen, isEdit, isFetching, databaseData }: DatabasesFormProp) => {
    return (
        <AppDrawer
            open={isOpen}
            direction="right"
            isPlainContentSheet={false}
            setOpen={setIsOpen}
            className="custom-drawer-content !w-[633px]"
            dismissible={false}
            headerIcon={<Database />}
            header={<h3>{isEdit ? 'Edit Memory Store' : 'New Memory Store'}</h3>}
            content={
                <div className={cn('activity-feed-container p-4')}>
                    <FormBody isFetching={isFetching} databaseData={databaseData} />
                </div>
            }
            footer={
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        {/* <Button variant="secondary" size={'sm'} disabled>
                            Test Connection
                        </Button> */}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            onClick={() => {
                                setIsOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size={'sm'}>save</Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be saved
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            }
        />
    );
};
