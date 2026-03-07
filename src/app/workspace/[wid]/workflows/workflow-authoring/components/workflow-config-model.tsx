/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { GenerateMethod, useWorkflowExecution } from '@/hooks/use-workflow-execution';
import { cn } from '@/lib/utils';
import { ISharedItem, IWorkflowTypes } from '@/models';
import { ArrowDownToLine, Copy, Eye, EyeOff, InfoIcon, MessageCircleMore } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import VariableConfigModal from './variable-config-modal';
import { Chatbot, ChatbotRef } from './chat-bot';

interface WorkFlowConfigurationModelProps {
    loadingVariables?: boolean;
    workFlowId: string;
    openWorkFlowConfigModel: boolean;
    variables: ISharedItem[] | undefined;
    setOpenWorkFlowConfigModel: React.Dispatch<React.SetStateAction<boolean>>;
    availableVersions?: IWorkflowTypes[];
    isDraft: boolean | undefined;
}

export const WorkflowConfigurationModel = ({
    loadingVariables,
    workFlowId,
    openWorkFlowConfigModel,
    variables,
    setOpenWorkFlowConfigModel,
    availableVersions,
    isDraft,
}: WorkFlowConfigurationModelProps) => {
    const params = useParams();
    const chatbotRef = useRef<ChatbotRef>(null);
    const { isMobile } = useBreakpoint();
    const [isChatSectionVisible, setIsChatSectionVisible] = useState(!isMobile);
    const [mounted, setMounted] = useState<boolean>(false);
    const {
        key,
        isFullScreen,
        apiConfigData,
        isHidden,
        apiKeyCopied,
        isApiKeyLoading,
        isSsoLoading,
        selectedLanguage,
        apiConfigCopied,
        currentGenerateMethod,
        sessionId,
        variableOptions,
        apiKey,
        isVariableOpen,
        messageHistory,
        setMessageHistory,
        setVariableOptions,
        setSelectedLanguage,
        setApiConfigData,
        setSessionId,
        setIsHidden,
        setIsFullScreen,
        setVariableOpen,
        handleGenerate,
        handleDownloadPostmanCollection,
        handleApiKeyCopy,
        handleApConfigCopy,
        resetChat,
        draftVersion,
    } = useWorkflowExecution({ workFlowId, availableVersions, isDraft });

    useEffect(() => {
        setApiConfigData(null);
        setIsChatSectionVisible(!isMobile);
        setSessionId(crypto.randomUUID());
    }, [workFlowId]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (chatbotRef?.current && openWorkFlowConfigModel && !mounted) {
                setMessageHistory([]);
                chatbotRef.current.clearMessages();
                setMounted(true);
            }
        }, 0);
        return () => clearTimeout(timeout);
    }, [workFlowId, openWorkFlowConfigModel]);

    return (
        <>
            <Sheet open={openWorkFlowConfigModel} onOpenChange={setOpenWorkFlowConfigModel}>
                <SheetContent side={'bottom'} className=" pb-3 z-[100010]" hideClose={isFullScreen}>
                    <SheetHeader>
                        <SheetTitle>Workflow Config</SheetTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Use SSO or generate API key to test out the workflow
                        </p>
                    </SheetHeader>
                    <SheetDescription className="grid grid-cols-12 gap-6 mt-2" asChild>
                        <div>
                            <div
                                className={`col-span-12 md:col-span-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md ${
                                    isMobile && isChatSectionVisible ? 'hidden' : ''
                                }`}
                            >
                                {apiConfigData ? (
                                    apiConfigData?.apiConfig?.map((item) => (
                                        <div
                                            className="flex justify-between w-full items-end md:block mb-2"
                                            key={item.label}
                                        >
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 dark:text-gray-100">
                                                    {item.label}
                                                </label>
                                                <div className="flex items-center bg-gray-100 dark:bg-gray-300 p-2 rounded-md">
                                                    <input
                                                        type={isHidden ? 'password' : 'text'}
                                                        value={item.value}
                                                        readOnly
                                                        className="flex-1 bg-transparent text-sm text-gray-900 outline-none"
                                                    />
                                                    <div>
                                                        <Button
                                                            className="mx-2"
                                                            size="icon"
                                                            variant="link"
                                                            onClick={() => setIsHidden(!isHidden)}
                                                        >
                                                            {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                                        </Button>

                                                        <div className="relative inline-block">
                                                            <Button
                                                                size="icon"
                                                                variant="link"
                                                                onClick={handleApiKeyCopy}
                                                            >
                                                                <Copy size={16} />
                                                            </Button>

                                                            {apiKeyCopied && (
                                                                <div
                                                                    className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                                                                    style={{ zIndex: 10 }}
                                                                >
                                                                    Copied!
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {isMobile && (
                                                <Button
                                                    size={'lg'}
                                                    variant="primary"
                                                    onClick={() => {
                                                        setIsChatSectionVisible(!isChatSectionVisible);
                                                    }}
                                                >
                                                    <MessageCircleMore size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col gap-y-4">
                                        {/* API Key Authentication */}
                                        <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                                            <div className="flex items-center space-x-2">
                                                <InfoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                        API Key Authentication
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Use an Application Token to securely authenticate API requests.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                className="p-2"
                                                onClick={() => handleGenerate(GenerateMethod.BY_API)}
                                                loading={isApiKeyLoading}
                                            >
                                                Continue with API Key
                                            </Button>
                                        </div>

                                        {/* SSO Authentication */}
                                        <div className="flex items-center justify-between p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                                            <div className="flex items-center space-x-2">
                                                <InfoIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                                                        Single Sign-On (SSO)
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Sign in using your organization&#39;s SSO to access workflows.
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="primary"
                                                size="md"
                                                className="p-2"
                                                onClick={() => handleGenerate(GenerateMethod.BY_SSO)}
                                                loading={isSsoLoading}
                                            >
                                                Continue with SSO
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {apiConfigData && (
                                    <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                        <TabsList className="flex justify-between">
                                            <div className="flex gap-2">
                                                {Object.keys(apiConfigData.codeSnippets).map(lang => (
                                                    <TabsTrigger
                                                        key={lang}
                                                        value={lang}
                                                        className={cn(
                                                            'px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md',
                                                            {
                                                                'text-blue-500 dark:text-blue-400':
                                                                    selectedLanguage === lang,
                                                                'text-gray-700 dark:text-gray-300':
                                                                    selectedLanguage !== lang,
                                                            }
                                                        )}
                                                    >
                                                        {lang}
                                                    </TabsTrigger>
                                                ))}
                                            </div>

                                            <Button
                                                className="float-end me-2"
                                                size="icon"
                                                variant="link"
                                                onClick={handleDownloadPostmanCollection}
                                            >
                                                <ArrowDownToLine className="text-dark" size={16} /> Postman request
                                            </Button>
                                        </TabsList>
                                        {Object.entries(apiConfigData?.codeSnippets).map(([lang, code]) => (
                                            <TabsContent
                                                key={lang}
                                                value={lang}
                                                className="dark:border-blue-900 dark:border rounded-md"
                                            >
                                                <div className="relative bg-gray-900 text-white p-4 rounded-md mt-2">
                                                    <div className="flex justify-between text-sm font-semibold mb-2">
                                                        <span>{lang.toUpperCase()}</span>
                                                        <div className="flex gap-x-3">
                                                            <div className="relative inline-block">
                                                                <Button
                                                                    size="icon"
                                                                    variant="link"
                                                                    onClick={() => {
                                                                        handleApConfigCopy(code);
                                                                    }}
                                                                >
                                                                    <Copy className="text-gray-300" size={16} />
                                                                </Button>

                                                                {apiConfigCopied && (
                                                                    <div
                                                                        className="absolute left-1/2 transform -translate-x-1/2 bottom-6 text-xs text-gray-200 bg-black p-2 rounded-md shadow-lg"
                                                                        style={{ zIndex: 10 }}
                                                                    >
                                                                        Copied!
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm whitespace-pre-wrap h-[35vh] custom-overflow-auto text-blue-500">
                                                        <pre className={`language-${lang.toLowerCase()} block`}>
                                                            {code}
                                                        </pre>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                )}
                            </div>
                            <Chatbot
                                ref={chatbotRef}
                                key={key}
                                workFlowId={workFlowId}
                                currentGenerateMethod={currentGenerateMethod}
                                sessionId={sessionId}
                                variableOptions={variableOptions}
                                apiKey={apiKey}
                                wid={params?.wid}
                                apiConfigData={apiConfigData}
                                isFullScreen={isFullScreen}
                                isMobile={isMobile}
                                isChatSectionVisible={isChatSectionVisible}
                                openWorkFlowConfigModel={openWorkFlowConfigModel}
                                messageHistory={messageHistory}
                                setMessageHistory={setMessageHistory}
                                setIsFullScreen={setIsFullScreen}
                                setSessionId={setSessionId}
                                setIsChatSectionVisible={setIsChatSectionVisible}
                                setVariableOpen={setVariableOpen}
                                onReload={() => resetChat()}
                                draftVersion={draftVersion}
                                isDraft={isDraft}
                            />
                        </div>
                    </SheetDescription>
                </SheetContent>
            </Sheet>
            <VariableConfigModal
                isOpen={isVariableOpen}
                isLoading={loadingVariables}
                variables={variables}
                currentVariable={variableOptions}
                setOpen={setVariableOpen}
                onApplyVariables={value => setVariableOptions(value)}
            />
        </>
    );
};
