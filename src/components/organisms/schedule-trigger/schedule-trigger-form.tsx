/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';
import { StepWizardView } from '@/components/molecules';
import { ScheduleTriggerStepType } from '@/enums';
import { IConnectorForm, IScheduleTrigger, ISharedItem } from '@/models';
import {
    Control,
    FieldArrayWithId,
    FieldErrors,
    UseFieldArrayRemove,
    UseFormGetValues,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { ApiToolResponseType } from '@/app/workspace/[wid]/agents/components/agent-form';
import { LoadingPlaceholder } from '@/components';

const ScheduleTriggerBasicStep = dynamic(() => import('./components/schedule-trigger-basic-step'), {
    loading: () => <LoadingPlaceholder text="Loading your basic trigger setup..." className="h-[44vh]" />,
});

const ScheduleTriggerStep = dynamic(() => import('./components/schedule-trigger-step'), {
    loading: () => <LoadingPlaceholder text="Preparing your scheduling options..." className="h-[44vh]" />,
});

const ScheduleTriggerDataStep = dynamic(() => import('./components/schedule-trigger-data-step'), {
    ssr: false,
    loading: () => <LoadingPlaceholder text="Setting up your execution data options...." className="h-[44vh]" />,
});

const ScheduleTriggerReviewStep = dynamic(() => import('./components/schedule-trigger-review-step'), {
    loading: () => <LoadingPlaceholder text="Reviewing your setup — almost there..." className="h-[44vh]" />,
});

export interface ScheduleTriggerFormProps extends ScheduleTriggerComponentProps {
    isOpen: boolean;
    activeStep: ScheduleTriggerStepType;
    workflowVariables: ISharedItem[];
    sharedVariables: ISharedItem[];
    apiLoading?: boolean;
    loadingConnectors: boolean;
    loadingIntellisense: boolean;
    allApiTools?: ApiToolResponseType[];
    connectors?: IConnectorForm[];
    refetchApiTools?: () => void;
    refetchConnector?: () => void;
    refetchIntellisense?: () => Promise<void>;
}

interface ScheduleTriggerComponentProps {
    isValid: boolean;
    errors: FieldErrors<IScheduleTrigger>;
    control: Control<IScheduleTrigger, any>;
    workflowVariableFields: FieldArrayWithId<IScheduleTrigger, 'configurations.data.workflowVariables', 'id'>[];
    queryVariableFields: FieldArrayWithId<
        IScheduleTrigger,
        'configurations.data.externalDataSource.connector.variables',
        'id'
    >[];
    allIntellisenseValues: string[];
    intellisenseOptions: any;
    isEdit: boolean;
    isReadOnly: boolean;
    openScheduleTrigger: boolean;
    editorContent: string;
    register: UseFormRegister<IScheduleTrigger>;
    watch: UseFormWatch<IScheduleTrigger>;
    trigger: UseFormTrigger<IScheduleTrigger>;
    getValues: UseFormGetValues<IScheduleTrigger>;
    setValue: UseFormSetValue<IScheduleTrigger>;
    appendWorkflowVariable: () => void;
    removeWorkflowVariable: UseFieldArrayRemove;
    validateFile: () => void;
    validateFileUrl: (url: string) => string | true;
    handleEditorChange: (value: string) => Promise<void>;
    handleSubmit: UseFormHandleSubmit<IScheduleTrigger, undefined>;
    onPreview: (url: string) => void;
}

export const ScheduleTriggerForm = (props: ScheduleTriggerFormProps) => {
    return (
        <StepWizardView
            panes={[
                {
                    id: ScheduleTriggerStepType.BASIC,
                    label: 'Basic',
                    content: <ScheduleTriggerBasicStep {...props} />,
                },
                {
                    id: ScheduleTriggerStepType.SCHEDULE,
                    label: 'Schedule',
                    content: <ScheduleTriggerStep {...props} />,
                },
                {
                    id: ScheduleTriggerStepType.DATA,
                    label: 'Data',
                    content: <ScheduleTriggerDataStep {...props} />,
                },
                {
                    id: ScheduleTriggerStepType.REVIEW,
                    label: 'Review',
                    content: <ScheduleTriggerReviewStep {...props} />,
                },
            ]}
            activeStep={props.activeStep}
        />
    );
};
