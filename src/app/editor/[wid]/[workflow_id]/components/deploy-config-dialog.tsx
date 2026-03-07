/* eslint-disable @next/next/no-img-element */
import React, { Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter, DialogHeader } from '@/components/atoms/dialog';
import { Button } from '@/components';
import { useComparisonSections } from '@/hooks/use-comparison-sections';
import { CircleCheckBig } from 'lucide-react';
import { CodeSandboxSVG } from '@/components/atoms/code-sandbox-svg';
import { IComparisonSection } from '@/models';
import { ComparisonChanges } from './comparison-changes';
import { ComparisonStatus } from '@/enums/config-type';

interface DeployConfigDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (configType: string, newValue: string) => void;
    setOpenNewModal: Dispatch<SetStateAction<boolean>>;
    sourcePackageName?: string;
    targetPackageName?: string;
    sourceVersion?: string;
    targetVersion?: string;
    sections: IComparisonSection[];
}

const VersionVisualization: React.FC<{
    sourceVersion?: string;
    targetVersion?: string;
}> = ({ sourceVersion, targetVersion }) => (
    <div className="flex items-center justify-center gap-8 py-8">
        <div className="text-center">
            <CodeSandboxSVG />
            <p className="text-lg font-medium">From V{sourceVersion}</p>
        </div>
        <div className="flex-shrink-0">
            <div className="flex items-center justify-center mx-20">
                <img src="/png/mgt-deploy-loader.gif" alt="Deploy loader animation" className="w-16 h-16" />
            </div>
        </div>
        <div className="text-center">
            <CodeSandboxSVG />
            <p className="text-lg font-medium">To V{targetVersion}</p>
        </div>
    </div>
);

const StatusSection: React.FC = () => (
    <div className="p-4 border-2 border-solid rounded-lg border-gray-300 dark:border-gray-700">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="flex items-center gap-2">
                <CircleCheckBig className="text-green-800 w-4 h-4 dark:text-green-400" />
                <span className="text-green-600 font-medium">Validated</span>
            </div>
        </div>
    </div>
);

const DialogActions: React.FC<{
    onCancel: () => void;
    onConfirm: () => void;
}> = ({ onCancel, onConfirm }) => (
    <DialogFooter>
        <Button variant="secondary" onClick={onCancel}>
            Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
            Confirm Deploy
        </Button>
    </DialogFooter>
);

export const DeployConfigDialog: React.FC<DeployConfigDialogProps> = ({
    open,
    onOpenChange,
    setOpenNewModal,
    sourcePackageName,
    targetPackageName,
    sourceVersion,
    targetVersion,
    sections,
    onSave,
}) => {
    const { handleConfirmDeploy } = useComparisonSections({
        isPull: true,
        sourcePackageName,
        targetPackageName,
        sourceVersion,
        targetVersion,
    });

    console.log(onSave);

    const handleCancel = () => {
        setOpenNewModal(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader />

                <DialogBody className="space-y-6">
                    <div className="text-xl pt-10 text-center">You are going to make pull</div>

                    <VersionVisualization sourceVersion={sourceVersion} targetVersion={targetVersion} />

                    <StatusSection />

                    <ComparisonChanges
                        sections={sections}
                        filterBy={[ComparisonStatus.VERIFIED]}
                        setOpenNewModal={setOpenNewModal}
                    />
                </DialogBody>

                <DialogActions
                    onCancel={handleCancel}
                    onConfirm={() => handleConfirmDeploy(targetPackageName as string, targetVersion as string)}
                />
            </DialogContent>
        </Dialog>
    );
};
