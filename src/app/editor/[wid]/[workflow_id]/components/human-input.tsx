/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { Dispatch, forwardRef, SetStateAction, useImperativeHandle } from 'react';
import { X, Check } from 'lucide-react';
import {
    Checkbox,
    Label,
    Button,
    Textarea,
    RadioChips,
    OptionModel,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components';
import { DetailItemInput } from '@/components/molecules/detail-item-input/detail-item-input';
import { AgentType } from '@/components/organisms/workflow-editor-form/agent-form';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { cn, isNullOrEmpty, validateSpaces } from '@/lib/utils';
import { useHumanInput } from '@/hooks/use-human-input';
import { IMessageBroker, INodeHumanInput } from '@/models';
import { MessageBrokerTriggerType } from '@/enums';
import {
    Control,
    Controller,
    FieldErrors,
    UseFormClearErrors,
    UseFormRegister,
    UseFormSetValue,
    UseFormTrigger,
    UseFormWatch,
} from 'react-hook-form';
import { MessageTopic } from './message-broker/message-topic';

export interface HumanInputRef {
    getHumanInputData: () => INodeHumanInput | undefined;
}

export interface HumanInputProps {
    isReadOnly?: boolean;
    humanInput: INodeHumanInput | undefined;
    agent?: AgentType;
    messageBrokers: IMessageBroker[];
    workflowId?: string;
    setHumanInput: React.Dispatch<React.SetStateAction<INodeHumanInput | undefined>>;
    onHumanInputChange?: (humanInput: INodeHumanInput | undefined) => void;
}

interface MessageTopicFormBodyProps extends HumanInputProps {
    isOpen: boolean;
    inboundOptions: OptionModel[];
    outboundOptions: OptionModel[];
    errors: FieldErrors<INodeHumanInput>;
    control: Control<INodeHumanInput, any>;
    loadingIntellisense: boolean;
    intellisenseOptions: any;
    allIntellisenseValues: string[];
    enableConsumer: boolean;
    setEnableConsumer: Dispatch<SetStateAction<boolean>>;
    register: UseFormRegister<INodeHumanInput>;
    setValue: UseFormSetValue<INodeHumanInput>;
    watch: UseFormWatch<INodeHumanInput>;
    trigger: UseFormTrigger<INodeHumanInput>;
    clearErrors: UseFormClearErrors<INodeHumanInput>;
    refetchVariables: () => Promise<void>;
}

interface HumanInputSummaryProps {
    humanInput: INodeHumanInput | undefined;
    enableConsumer: boolean;
}

const HumanInputSummary = ({ humanInput, enableConsumer }: HumanInputSummaryProps) => {
    if (!humanInput) return undefined;

    return (
        <>
            {!isNullOrEmpty(humanInput?.instruction) && (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-100" title={humanInput?.instruction}>
                    {humanInput?.instruction?.length > 65
                        ? `${humanInput?.instruction?.slice(0, 62)}...`
                        : humanInput?.instruction}
                </p>
            )}
            <p
                className={`flex items-center text-sm font-regular ${
                    humanInput?.enableBroker ? 'text-green-500' : 'text-red-500'
                }`}
            >
                {humanInput?.enableBroker ? <Check size={16} /> : <X size={16} />}
                &nbsp;-&nbsp;Message Broker
            </p>
            {humanInput?.enableBroker && (
                <>
                    <p
                        className={`flex items-center text-sm font-regular ${
                            humanInput?.topicProducer ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                        {humanInput?.topicProducer ? <Check size={16} /> : <X size={16} />}
                        &nbsp;-&nbsp;Topic Producer
                    </p>
                    <p
                        className={`flex items-center text-sm font-regular ${
                            enableConsumer ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                        {enableConsumer ? <Check size={16} /> : <X size={16} />}
                        &nbsp;-&nbsp;Topic Consumer
                    </p>
                </>
            )}
        </>
    );
};

interface HumanInputFooterProps {
    humanInput: INodeHumanInput | undefined;
    agent?: AgentType;
    setOpen: (open: boolean) => void;
    handleRemove: () => void;
    watch: UseFormWatch<INodeHumanInput>;
    setValue: UseFormSetValue<INodeHumanInput>;
}

const HumanInputFooter = ({ humanInput, agent, setOpen, handleRemove, watch, setValue }: HumanInputFooterProps) => {
    if (humanInput) {
        return (
            <div className="w-full flex justify-start items-center gap-x-3">
                <Button variant="link" className="text-blue-400" onClick={() => setOpen(true)}>
                    {agent?.isReusableAgentSelected ? 'View Human Input' : 'Change'}
                </Button>
                {!agent?.isReusableAgentSelected && (
                    <Button variant="link" className="text-red-500 hover:text-red-400" onClick={handleRemove}>
                        Remove
                    </Button>
                )}
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex items-center gap-2 flex-shrink-0">
                <Checkbox
                    id="enable-human-review"
                    checked={!!watch('enableHumanInput')}
                    onCheckedChange={checked => {
                        setValue('enableHumanInput', checked === true);
                    }}
                />
                <Label
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    htmlFor="enable-human-review"
                    onClick={() => setOpen(true)}
                >
                    Enable Human Review
                </Label>
            </div>
        );
    }

    return null;
};

const FormBody = (props: MessageTopicFormBodyProps) => {
    const {
        isOpen,
        agent,
        messageBrokers,
        inboundOptions,
        outboundOptions,
        errors,
        control,
        isReadOnly,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        humanInput,
        enableConsumer,
        setEnableConsumer,
        register,
        setValue,
        watch,
        trigger,
        clearErrors,
        refetchVariables,
    } = props;

    // Producer section: Outbound topic dropdown should be disabled until a broker is selected
    const producerBrokerId = watch('topicProducer.messageBrokerId');
    const producerTopicDropdownDisabled = !producerBrokerId;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 sm:gap-4">
            {/* Instruction Field */}
            <div className="col-span-1 sm:col-span-2">
                <Textarea
                    {...register('instruction', {
                        required: {
                            value: true,
                            message: 'Please enter an instruction',
                        },
                        validate: value => validateSpaces(value, 'instruction'),
                    })}
                    label="Message To Human"
                    placeholder="Enter a message"
                    rows={4}
                    className="w-full resize-none"
                    disabled={isReadOnly || agent?.isReusableAgentSelected}
                    isDestructive={!!errors?.instruction?.message}
                    supportiveText={errors?.instruction?.message}
                />
            </div>

            {/* Enable Message Broker Field */}
            <div className="col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Checkbox
                        id="enableBroker"
                        checked={!!watch('enableBroker')}
                        disabled={isReadOnly || agent?.isReusableAgentSelected}
                        onCheckedChange={checked => {
                            setValue('enableBroker', checked === true);
                        }}
                    />
                    <Label
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                        htmlFor="enableBroker"
                    >
                        Connect To Message Broker
                    </Label>
                </div>
            </div>

            {watch('enableBroker') && (
                <>
                    {/* RadioChips Section */}
                    <div className="col-span-1 sm:col-span-2">
                        <Controller
                            name="option"
                            control={control}
                            rules={{
                                required: {
                                    value: true,
                                    message: 'Please select an option',
                                },
                            }}
                            render={({ field }) => (
                                <RadioChips
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isReadOnly || agent?.isReusableAgentSelected}
                                    options={[
                                        {
                                            value: MessageBrokerTriggerType.API,
                                            label: MessageBrokerTriggerType.API,
                                            disabled: true,
                                        },
                                        {
                                            value: MessageBrokerTriggerType.MessageBroker,
                                            label: MessageBrokerTriggerType.MessageBroker,
                                        },
                                    ]}
                                />
                            )}
                        />
                    </div>

                    {watch('option') === MessageBrokerTriggerType.MessageBroker && (
                        <>
                            <div className="col-span-1 sm:col-span-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">Producer</Label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                                    <MessageTopic
                                        isOpen={isOpen}
                                        inboundOptions={inboundOptions}
                                        outboundOptions={outboundOptions}
                                        isFeedbackPublisher={true}
                                        propertyName="topicProducer"
                                        messageBrokers={messageBrokers}
                                        isReadOnly={isReadOnly}
                                        agent={agent}
                                        control={control}
                                        loadingIntellisense={loadingIntellisense}
                                        intellisenseOptions={intellisenseOptions}
                                        allIntellisenseValues={allIntellisenseValues}
                                        humanInput={humanInput}
                                        setValue={setValue}
                                        watch={watch}
                                        trigger={trigger}
                                        clearErrors={clearErrors}
                                        refetchVariables={refetchVariables}
                                        topicDropdownDisabled={producerTopicDropdownDisabled}
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Checkbox
                                        id="enableConsumer"
                                        checked={enableConsumer}
                                        disabled={isReadOnly || agent?.isReusableAgentSelected}
                                        onCheckedChange={checked => {
                                            setEnableConsumer(checked === true);
                                        }}
                                    />
                                    <Label
                                        className="text-sm font-medium text-gray-700 dark:text-gray-100 cursor-pointer"
                                        htmlFor="enableConsumer"
                                    >
                                        Consumer
                                    </Label>
                                </div>
                                {enableConsumer && (
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 space-y-4 bg-gray-50 dark:bg-gray-800 mt-2">
                                        <MessageTopic
                                            isOpen={isOpen}
                                            inboundOptions={inboundOptions}
                                            outboundOptions={outboundOptions}
                                            isFeedbackPublisher={false}
                                            propertyName="topicConsumer"
                                            messageBrokers={messageBrokers}
                                            isReadOnly={isReadOnly}
                                            agent={agent}
                                            control={control}
                                            loadingIntellisense={loadingIntellisense}
                                            intellisenseOptions={intellisenseOptions}
                                            allIntellisenseValues={allIntellisenseValues}
                                            humanInput={humanInput}
                                            setValue={setValue}
                                            watch={watch}
                                            trigger={trigger}
                                            clearErrors={clearErrors}
                                            refetchVariables={refetchVariables}
                                            topicDropdownDisabled={!watch('topicConsumer.messageBrokerId')}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export const HumanInput = forwardRef<HumanInputRef, HumanInputProps>((props, ref) => {
    const { agent, humanInput, isReadOnly } = props;

    // Use the existing hook instead of local state
    const {
        isOpen,
        isValid,
        inboundOptions,
        outboundOptions,
        errors,
        control,
        loadingIntellisense,
        intellisenseOptions,
        allIntellisenseValues,
        enableConsumer,
        setEnableConsumer,
        setValue,
        setOpen,
        register,
        watch,
        trigger,
        clearErrors,
        handleRemove,
        handleSubmit,
        onHandleSubmit,
        refetchVariables,
    } = useHumanInput(props);

    useImperativeHandle(ref, () => ({
        getHumanInputData: () => {
            return humanInput;
        },
    }));

    return (
        <>
            <DetailItemInput
                label="Human Review"
                values={undefined}
                imagePath="/png/knowledge_empty.png"
                imageType="png"
                imageWidth="100"
                description="No human review option configured. Please use 'Enable Human Review' to enable the human feedback"
                other={
                    humanInput ? (
                        <HumanInputSummary humanInput={humanInput} enableConsumer={enableConsumer} />
                    ) : undefined
                }
                footer={
                    <HumanInputFooter
                        humanInput={humanInput}
                        agent={agent}
                        setOpen={setOpen}
                        handleRemove={handleRemove}
                        watch={watch}
                        setValue={setValue}
                    />
                }
            />

            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpen}
                className="custom-drawer-content !w-[633px]"
                dismissible={false}
                header="Human Review"
                footer={
                    <div className="flex gap-2 justify-end w-full">
                        <Button variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="primary"
                                        disabled={!isValid || agent?.isReusableAgentSelected || isReadOnly}
                                        onClick={handleSubmit(onHandleSubmit)}
                                    >
                                        {humanInput ? 'Change' : 'Add'}
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details needs to be filled before the form can be saved
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
                            isOpen={isOpen}
                            inboundOptions={inboundOptions}
                            outboundOptions={outboundOptions}
                            errors={errors}
                            control={control}
                            loadingIntellisense={loadingIntellisense}
                            intellisenseOptions={intellisenseOptions}
                            allIntellisenseValues={allIntellisenseValues}
                            enableConsumer={enableConsumer}
                            setEnableConsumer={setEnableConsumer}
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            trigger={trigger}
                            clearErrors={clearErrors}
                            refetchVariables={async () => {
                                await refetchVariables();
                            }}
                        />
                    </div>
                }
            />
        </>
    );
});

HumanInput.displayName = 'HumanInput';

export default HumanInput;
