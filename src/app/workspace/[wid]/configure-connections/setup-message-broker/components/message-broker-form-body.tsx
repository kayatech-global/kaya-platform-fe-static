/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import { Info, Plus } from 'lucide-react';
import {
    Button,
    Input,
    Label,
    Textarea,
    Select,
    VaultSelector,
    Spinner,
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    OptionModel,
} from '@/components';
import { validateSpaces } from '@/lib/utils';
import { AuthenticationType, MessageBrokerProviderType, MessageBrokerTopicType } from '@/enums';
import { MessageBrokerStructure } from './message-broker-structure';
import { validateField } from '@/utils/validation';
import { MessageBrokerFormProps } from './message-broker-form';
import { MESSAGE_BROKER_TOPIC_CONTENT } from '@/constants';

const BasicAndSaslAuthFields = (props: MessageBrokerFormProps & { isReadOnly: boolean }) => {
    const { isEdit, errors, secrets, loadingSecrets, isModalRequest, register, watch, refetch, isReadOnly } = props;
    const isBasicAuth = watch('configurations.authenticationType') === AuthenticationType.BasicAuth;

    return (
        <div className={`grid grid-cols-1 ${isModalRequest ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
            {/* Username field */}
            <Input
                {...register('configurations.meta.username', {
                    required: { value: true, message: 'Please enter an username' },
                })}
                placeholder="Enter an username"
                readOnly={isEdit && isReadOnly}
                isDestructive={!!errors.configurations?.meta?.username?.message}
                supportiveText={errors.configurations?.meta?.username?.message}
            />

            {/* Vault Key field */}
            {isBasicAuth ? (
                <VaultSelector
                    {...register('configurations.meta.password', {
                        required: { value: true, message: 'Please select a password key/vault' },
                    })}
                    placeholder={secrets.length > 0 ? 'Select password Key/Vault' : 'No password Key/Vault found'}
                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                    options={secrets}
                    currentValue={watch('configurations.meta.password')}
                    isDestructive={!!errors.configurations?.meta?.password?.message}
                    supportiveText={errors.configurations?.meta?.password?.message}
                    disableCreate={isEdit && isReadOnly}
                    loadingSecrets={loadingSecrets}
                    onRefetch={() => refetch()}
                />
            ) : (
                <VaultSelector
                    {...register('configurations.meta.secret', {
                        required: { value: true, message: 'Please select a secret key/vault' },
                    })}
                    placeholder={secrets.length > 0 ? 'Select Secret Key/Vault' : 'No Secret Key/Vault found'}
                    disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                    options={secrets}
                    currentValue={watch('configurations.meta.secret')}
                    isDestructive={!!errors.configurations?.meta?.secret?.message}
                    supportiveText={errors.configurations?.meta?.secret?.message}
                    disableCreate={isEdit && isReadOnly}
                    loadingSecrets={loadingSecrets}
                    onRefetch={() => refetch()}
                />
            )}
        </div>
    );
};

const BearerTokenFields = (props: MessageBrokerFormProps & { isReadOnly: boolean }) => {
    const { isEdit, errors, secrets, loadingSecrets, register, watch, refetch, isReadOnly } = props;
    return (
        <VaultSelector
            {...register('configurations.meta.token', {
                required: { value: true, message: 'Please select a token key/vault' },
            })}
            placeholder={secrets.length > 0 ? 'Select Token Key/Vault' : 'No Token Key/Vault found'}
            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
            options={secrets}
            currentValue={watch('configurations.meta.token')}
            isDestructive={!!errors.configurations?.meta?.token?.message}
            supportiveText={errors.configurations?.meta?.token?.message}
            disableCreate={isEdit && isReadOnly}
            loadingSecrets={loadingSecrets}
            onRefetch={() => refetch()}
        />
    );
};

const KerberoseFields = (props: MessageBrokerFormProps & { isReadOnly: boolean }) => {
    const { isEdit, errors, secrets, loadingSecrets, register, watch, refetch, isReadOnly } = props;
    return (
        <VaultSelector
            {...register('configurations.meta.secret', {
                required: { value: true, message: 'Please select a secret key/vault' },
            })}
            placeholder={secrets.length > 0 ? 'Select Secret Key/Vault' : 'No Secret Key/Vault found'}
            disabled={secrets.length === 0 || (isEdit && isReadOnly)}
            options={secrets}
            currentValue={watch('configurations.meta.secret')}
            isDestructive={!!errors.configurations?.meta?.secret?.message}
            supportiveText={errors.configurations?.meta?.secret?.message}
            disableCreate={isEdit && isReadOnly}
            loadingSecrets={loadingSecrets}
            onRefetch={() => refetch()}
        />
    );
};

const TlsFields = (props: MessageBrokerFormProps & { isReadOnly: boolean }) => {
    const { isEdit, errors, secrets, loadingSecrets, isModalRequest, register, watch, refetch, isReadOnly } = props;
    return (
        <div className={`grid grid-cols-1 ${isModalRequest ? 'sm:grid-cols-1' : 'sm:grid-cols-2'} gap-4`}>
            <VaultSelector
                {...register('configurations.meta.certificate', {
                    required: { value: true, message: 'Please select a certificate key/vault' },
                })}
                placeholder={secrets.length > 0 ? 'Select Certificate Key/Vault' : 'No Certificate Key/Vault found'}
                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                options={secrets}
                currentValue={watch('configurations.meta.certificate')}
                isDestructive={!!errors.configurations?.meta?.certificate?.message}
                supportiveText={errors.configurations?.meta?.certificate?.message}
                disableCreate={isEdit && isReadOnly}
                loadingSecrets={loadingSecrets}
                onRefetch={() => refetch()}
            />
            <VaultSelector
                {...register('configurations.meta.clientKey', {
                    required: { value: true, message: 'Please select a private key/vault' },
                })}
                placeholder={secrets.length > 0 ? 'Select Private Key/Vault' : 'No Private Key/Vault found'}
                disabled={secrets.length === 0 || (isEdit && isReadOnly)}
                options={secrets}
                currentValue={watch('configurations.meta.clientKey')}
                isDestructive={!!errors.configurations?.meta?.clientKey?.message}
                supportiveText={errors.configurations?.meta?.clientKey?.message}
                disableCreate={isEdit && isReadOnly}
                loadingSecrets={loadingSecrets}
                onRefetch={() => refetch()}
            />
        </div>
    );
};

const MessageBrokerFormSecret = (props: MessageBrokerFormProps) => {
    const { watch } = props;

    const isReadOnly = useMemo(() => {
        const readOnlyValue = watch('isReadOnly');
        return !!readOnlyValue;
    }, [watch]);

    const authType = watch('configurations.authenticationType');

    switch (authType) {
        case AuthenticationType.BasicAuth:
        case AuthenticationType.SASLORSCRAM:
            return <BasicAndSaslAuthFields {...props} isReadOnly={isReadOnly} />;
        case AuthenticationType.BearerToken:
            return <BearerTokenFields {...props} isReadOnly={isReadOnly} />;
        case AuthenticationType.Kerberose:
            return <KerberoseFields {...props} isReadOnly={isReadOnly} />;
        case AuthenticationType.TLS:
            return <TlsFields {...props} isReadOnly={isReadOnly} />;
        default:
            return null;
    }
};

const BROKER_REGEX = /^(?!:\/\/)(\[?[a-zA-Z0-9:.%-]+\]?):(\d{1,5})$/;
const AWS_MSK_ARN_REGEX = /^arn:aws:kafka:[a-z0-9-]+:\d{12}:cluster\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
const AWS_MSK_BROKER_REGEX =
    /^b-\d+\.[a-zA-Z0-9-]+\.[a-zA-Z0-9]+\.[a-z0-9-]+\.kafka\.[a-z0-9-]+\.amazonaws\.com:(\d{1,5})$/;

export const validateUrl = (value: string, label: string) => {
    if (!value) return `${label} Please enter a ${label}`;

    if (value.startsWith(' ')) {
        return `No leading spaces in ${label}`;
    }
    if (value.endsWith(' ')) {
        return `No trailing spaces in ${label}`;
    }

    const urls = value.split(',').map(u => u.trim());

    for (const url of urls) {
        const match = BROKER_REGEX.exec(url);

        if (!match) {
            return `Invalid URL format in ${label}`;
        }

        const port = Number(match[2]);
        if (port < 1 || port > 65535) {
            return `Invalid port in ${label}`;
        }
    }

    return true;
};

export const validateAwsMskUrl = (value: string) => {
    const label = 'cluster ARN or bootstrap servers';
    if (!value) return `${label}: Please enter a ${label}`;

    if (value.startsWith(' ')) {
        return `No leading spaces in ${label}`;
    }
    if (value.endsWith(' ')) {
        return `No trailing spaces in ${label}`;
    }

    if (value.trim().startsWith('arn:')) {
        if (!AWS_MSK_ARN_REGEX.test(value.trim())) {
            return `Invalid AWS MSK ARN format in ${label}`;
        }
        return true;
    }

    const urls = value
        .trim()
        .split(',')
        .map(u => u.trim());

    for (const url of urls) {
        const match = AWS_MSK_BROKER_REGEX.exec(url);

        if (!match) {
            return `Invalid AWS MSK broker format in ${label}`;
        }

        const port = Number(match[1]);
        if (port < 1 || port > 65535) {
            return `Invalid port in ${label}`;
        }
    }

    return true;
};

export const MessageBrokerFormBody = (props: MessageBrokerFormProps) => {
    const [limit] = useState<number>(25);
    const {
        isEdit,
        errors,
        isTopicsTitleValid,
        loadingIntellisense,
        messageBrokerProviders,
        topicFields,
        selectedTopicId,
        register,
        watch,
        appendTopic,
        removeTopic,
        trigger,
        validateUniqueTitle,
    } = props;

    const watchedProvider = watch('provider');
    const isReadOnly = useMemo(() => {
        const readOnlyValue = watch('isReadOnly');
        return !!readOnlyValue;
    }, [watch]);

    const options = useMemo(() => {
        if (watchedProvider === MessageBrokerProviderType.AWS_MSK_Provisioned) {
            return [
                { name: 'No Authentication', value: AuthenticationType.NoAuthentication, disabled: true },
                { name: 'Basic Auth', value: AuthenticationType.BasicAuth, disabled: true },
                { name: 'SASL/SCRAM', value: AuthenticationType.SASLORSCRAM, disabled: true },
                { name: 'Bearer Token', value: AuthenticationType.BearerToken, disabled: true },
                { name: 'TLS', value: AuthenticationType.TLS },
            ] as OptionModel[];
        }
        return [
            { name: 'No Authentication', value: AuthenticationType.NoAuthentication },
            { name: 'Basic Auth', value: AuthenticationType.BasicAuth },
            { name: 'SASL/SCRAM', value: AuthenticationType.SASLORSCRAM },
            { name: 'Bearer Token', value: AuthenticationType.BearerToken, disabled: true },
        ] as OptionModel[];
    }, [watchedProvider]);

    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    const titleOnBlur = () => {
        topicFields.forEach(async (_, index) => {
            await trigger(`configurations.topics.${index}.title`);
        });
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <Input
                {...register('name', {
                    required: 'Please enter a name',
                    validate: value => validateSpaces(value, 'name'),
                })}
                label="Name"
                placeholder="Enter a Name"
                readOnly={isEdit && isReadOnly}
                isDestructive={!!errors.name?.message}
                supportiveText={errors.name?.message}
            />
            <Textarea
                {...register('description', {
                    required: descriptionValidate.required,
                    minLength: descriptionValidate.minLength,
                    validate: value => validateSpaces(value, 'description'),
                })}
                label="Description"
                placeholder="Enter a Description"
                className="w-full"
                readOnly={isEdit && isReadOnly}
                isDestructive={!!errors.description?.message}
                supportiveText={errors.description?.message}
            />
            <Select
                {...register('provider', {
                    required: 'Please select a provider',
                })}
                label="Provider"
                placeholder={messageBrokerProviders.length > 0 ? 'Select a Provider' : 'No Provider found'}
                disabled={messageBrokerProviders.length === 0 || (isEdit && isReadOnly)}
                currentValue={watch('provider')}
                isDestructive={!!errors.provider?.message}
                supportiveText={errors.provider?.message}
                options={messageBrokerProviders}
            />

            {(watch('provider') === MessageBrokerProviderType.ApacheKafka ||
                watch('provider') === MessageBrokerProviderType.AWS_MSK_Provisioned) && (
                <>
                    {/* Conditional Kafka Cluster URL field */}
                    {watch('provider') === MessageBrokerProviderType.ApacheKafka ? (
                        <Input
                            {...register('configurations.clusterUrl', {
                                required: {
                                    value: true,
                                    message: 'Please enter a Kafka cluster URL',
                                },
                                validate: value => validateUrl(value, 'Kafka cluster URL'),
                            })}
                            label="Kafka Cluster URL"
                            placeholder="Enter a Kafka cluster URL"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors.configurations?.clusterUrl?.message}
                            supportiveText={errors.configurations?.clusterUrl?.message}
                        />
                    ) : (
                        <Input
                            {...register('configurations.clusterUrl', {
                                required: {
                                    value: true,
                                    message: 'Please enter an AWS MSK provisioned cluster ARN or the bootstrap servers',
                                },
                                validate: validateAwsMskUrl,
                            })}
                            label="Cluster ARN or Bootstrap Servers List"
                            placeholder="Enter a Cluster ARN or Bootstrap Servers (Comma Separated List)"
                            readOnly={isEdit && isReadOnly}
                            isDestructive={!!errors.configurations?.clusterUrl?.message}
                            supportiveText={errors.configurations?.clusterUrl?.message}
                        />
                    )}

                    {/* Authentication Type dropdown for Apache Kafka */}
                    <Select
                        {...register('configurations.authenticationType', {
                            required: { value: true, message: 'Please select an authentication type' },
                        })}
                        label="Authentication Type"
                        placeholder="Select an authentication type"
                        currentValue={watch('configurations.authenticationType')}
                        disabled={isEdit && isReadOnly}
                        isDestructive={!!errors.configurations?.authenticationType?.message}
                        supportiveText={errors.configurations?.authenticationType?.message}
                        options={options}
                    />
                    {/* Conditional Authentication fields */}
                    <MessageBrokerFormSecret {...props} />

                    <div>
                        <Label>Topics</Label>

                        {/* Dynamic Topic Sections */}
                        {topicFields.map((field, index) => (
                            <div key={field.internalId} className={index === 0 ? 'mt-3' : 'mt-4'}>
                                {/* Topic Container with dashed border */}
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4 relative">
                                    {/* Remove button for additional topics */}
                                    {topicFields.length > 1 && !(isEdit && isReadOnly) && (
                                        <div className="flex justify-end items-center mb-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                disabled={field.id === selectedTopicId}
                                                onClick={() => removeTopic(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}

                                    {/* Roster file creation and Direction in same line */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Input
                                            {...register(`configurations.topics.${index}.title`, {
                                                required: 'Please enter a topic name',
                                                validate: value => validateUniqueTitle(value, index),
                                            })}
                                            label="Topic Name"
                                            placeholder="Enter a topic name"
                                            helperInfo="Only letters, numbers, ., _, - are allowed (1-249 chars)"
                                            isDestructive={!!errors.configurations?.topics?.[index]?.title?.message}
                                            supportiveText={errors.configurations?.topics?.[index]?.title?.message}
                                            onBlur={() => titleOnBlur()}
                                        />
                                        <Select
                                            {...register(`configurations.topics.${index}.topicType`, {
                                                required: 'Please select a topic type',
                                            })}
                                            label="Topic Type"
                                            placeholder="Select a topic type"
                                            currentValue={watch(`configurations.topics.${index}.topicType`)}
                                            options={[
                                                {
                                                    name: MessageBrokerTopicType.Inbound,
                                                    value: MessageBrokerTopicType.Inbound,
                                                },
                                                {
                                                    name: MessageBrokerTopicType.Outbound,
                                                    value: MessageBrokerTopicType.Outbound,
                                                },
                                            ]}
                                            isDestructive={!!errors.configurations?.topics?.[index]?.topicType?.message}
                                            supportiveText={errors.configurations?.topics?.[index]?.topicType?.message}
                                        />
                                    </div>

                                    {/* Request Structure */}
                                    <div className="col-span-1 sm:col-span-12 relative">
                                        <div className="col-span-1 sm:col-span-2 max-h-[70vh]">
                                            <div className="mb-2 text-xs flex items-center gap-x-2">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-100 flex items-baseline gap-x-1">
                                                    Request Structure
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info size={13} />
                                                        </TooltipTrigger>
                                                        <TooltipContent
                                                            side="right"
                                                            align="center"
                                                            className="max-w-[350px]"
                                                        >
                                                            {MESSAGE_BROKER_TOPIC_CONTENT.messageBrokerTopic.tooltip}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                            </div>
                                            {loadingIntellisense ? (
                                                <div className="w-full h-full flex items-center justify-center min-h-[480px]">
                                                    <div className="flex flex-col items-center gap-y-2">
                                                        <Spinner />
                                                        <p className="text-md text-gray-700 font-normal dark:text-gray-200">
                                                            {'Hold on, Request structure editor is getting ready...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <MessageBrokerStructure {...props} index={index} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Topic Button with connecting line - moves down with new sections */}
                        <div className="relative mt-0">
                            <div className="w-[2px] border-r border-r-gray-300 dark:border-r-gray-600 absolute left-1/2 transform -translate-x-1/2 -top-0 h-10 z-10"></div>
                            <div className="flex justify-center pt-10">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                disabled={
                                                    (isEdit && isReadOnly) ||
                                                    !isTopicsTitleValid ||
                                                    topicFields.length >= limit
                                                }
                                                className="flex items-center gap-2"
                                                onClick={appendTopic}
                                            >
                                                <Plus size={16} />
                                                Add Topic
                                            </Button>
                                        </TooltipTrigger>
                                        {topicFields.length >= limit && (
                                            <TooltipContent side="left" align="center">
                                                {`You've reached the limit. Only ${limit} topics can be added.`}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
