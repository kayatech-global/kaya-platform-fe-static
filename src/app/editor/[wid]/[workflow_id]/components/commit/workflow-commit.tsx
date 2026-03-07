/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionTextarea, Button, Label, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { useWorkspaceIntelligenceSourceConfigured } from '@/hooks/use-workspace-intelligence-source-configuration';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import RadioCard from '@/components/molecules/radio-card/radio-card';
import { releaseTypes } from '@/constants';
import { useWorkflowCommit } from '@/hooks/use-workflow-commit';
import { cn, validateSpaces } from '@/lib/utils';
import { IPackageCommit, IPackageWorkflow } from '@/models';
import { RadioGroup } from '@radix-ui/react-radio-group';
import { Slack } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { WorkflowCommitTable } from './workflow-commit-table';
import { validateField } from '@/utils/validation';
import { WorkflowCommitCompare } from './workflow-commit-compare';

export interface WorkflowCommitProps {
    isOpenCommit: boolean;
    workflowName: string;
    version?: string;
    setOpenCommit: Dispatch<SetStateAction<boolean>>;
    refetchGraph: () => void;
}

interface WorkflowCommitFormProps extends WorkflowCommitProps {
    workflows: IPackageWorkflow[];
    control: Control<IPackageCommit, any>;
    errors: FieldErrors<IPackageCommit>;
    generatingCommit: boolean;
    releaseVersion: string;
    isSaving: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    register: UseFormRegister<IPackageCommit>;
    watch: UseFormWatch<IPackageCommit>;
    onAction: (data: IPackageCommit) => void;
}

const FormBody = (props: WorkflowCommitFormProps) => {
    const { isConfigured: isLLMConfigured, isLoading: isLLMLoading } = useWorkspaceIntelligenceSourceConfigured();
    const {
        workflowName,
        workflows,
        control,
        errors,
        generatingCommit,
        releaseVersion,
        isSaving,
        version,
        setOpen,
        register,
        watch,
        onAction,
    } = props;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            <div className="col-span-1 sm:col-span-2">
                <div>
                    <Label>Select the Release type</Label>
                    <Controller
                        control={control}
                        name="releaseType"
                        rules={{
                            required: { value: true, message: 'Please select a release type' },
                        }}
                        render={({ field }) => (
                            <RadioGroup
                                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                {releaseTypes?.map((item) => (
                                    <RadioCard
                                        key={item.value}
                                        value={item.value}
                                        label={item.label}
                                        description={item.description}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    />
                </div>
                {!!errors?.releaseType?.message && (
                    <p className="text-xs font-normal text-red-500 dark:text-red-500 mt-2">
                        {errors?.releaseType?.message}
                    </p>
                )}
            </div>
            <div className="col-span-1 sm:col-span-2">
                <WorkflowCommitTable workflows={workflows} version={version} setOpen={setOpen} />
            </div>
            {watch('releaseType') && (
                <div className="col-span-1 sm:col-span-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <ActionTextarea
                                        {...register('releaseNote', {
                                            required: validateField('release note', {
                                                required: { value: true },
                                            }).required,
                                            minLength: validateField('Release note', {
                                                minLength: { value: 30 },
                                            }).minLength,
                                            validate: value => validateSpaces(value, 'release note'),
                                        })}
                                        actionClassName={cn({
                                            'pointer-events-none': isSaving,
                                            'opacity-50': !isLLMConfigured,
                                        })}
                                        rows={10}
                                        placeholder="Write release note here..."
                                        label={`${workflowName} V${releaseVersion}`}
                                        actionLabel={generatingCommit ? 'Generating' : 'Auto-generate'}
                                        disabled={generatingCommit}
                                        actionDisabled={generatingCommit || !isLLMConfigured || isLLMLoading}
                                        isDestructive={!!errors?.releaseNote?.message}
                                        supportiveText={errors?.releaseNote?.message}
                                        onAction={() => onAction(watch())}
                                        tooltipContent={
                                            !isLLMConfigured && !isLLMLoading ? (
                                                <TooltipContent side="left" align="center">
                                                    Please configure a workspace-level LLM (Intelligence Source) in
                                                    settings to enable auto-generation.
                                                </TooltipContent>
                                            ) : undefined
                                        }
                                    />
                                </div>
                            </TooltipTrigger>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}
        </div>
    );
};

export const WorkflowCommit = (props: WorkflowCommitProps) => {
    const { isOpenCommit, version, setOpenCommit } = props;
    const {
        workflows,
        errors,
        isValid,
        control,
        isSaving,
        generatingCommit,
        releaseVersion,
        isOpen,
        setOpen,
        register,
        watch,
        handleSubmit,
        onAction,
        onHandleSubmit,
    } = useWorkflowCommit(props);

    return (
        <>
            <AppDrawer
                open={isOpenCommit}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpenCommit}
                className="custom-drawer-content !w-[760px]"
                dismissible={false}
                headerIcon={<Slack />}
                header="Commit workflow"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setOpenCommit(false)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="sm"
                                        disabled={!isValid || isSaving}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {isSaving && !generatingCommit ? 'Saving' : 'Commit'}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be committed
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <FormBody
                            {...props}
                            workflows={workflows}
                            control={control}
                            errors={errors}
                            generatingCommit={generatingCommit}
                            releaseVersion={releaseVersion}
                            isSaving={isSaving}
                            setOpen={setOpen}
                            register={register}
                            watch={watch}
                            onAction={onAction}
                        />
                    </div>
                }
            />
            <WorkflowCommitCompare isOpen={isOpen} version={version} setOpen={setOpen} />
        </>
    );
};
