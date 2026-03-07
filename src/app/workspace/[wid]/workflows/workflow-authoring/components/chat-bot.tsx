'use client';

import React, { Dispatch, forwardRef, SetStateAction, useImperativeHandle, useState } from 'react';
import { Button, Label, Switch, Textarea } from '@/components';
import { MarkdownText } from '@/components/molecules/mardown-text/markdown-text';
import { cn, formatFileSize } from '@/lib/utils';
import { IFile, IVariableOption } from '@/models';
import {
    Code,
    FileSpreadsheet,
    Maximize,
    Minimize,
    Paperclip,
    RefreshCcw,
    Send,
    Variable,
    File,
    X,
} from 'lucide-react';
import { ChatMessage, useChatbot } from '@/hooks/use-chatbot';
import { APIConfigData } from '@/enums/component-type';
import { GenerateMethod } from '@/hooks/use-workflow-execution';
import { VideoWindow } from '@/app/workspace/[wid]/workflows/workflow-authoring/components/video-window';
import { ChatType } from '@/enums/ChatType';
import { DailyProvider } from '@daily-co/daily-react';

export interface ChatbotProps {
    workFlowId: string;
    currentGenerateMethod: GenerateMethod;
    sessionId: string;
    variableOptions: IVariableOption[] | undefined;
    apiKey: string;
    wid: unknown;
    apiConfigData: APIConfigData | null;
    isFullScreen: boolean;
    isMobile: boolean;
    isChatSectionVisible: boolean;
    openWorkFlowConfigModel: boolean;
    messageHistory: ChatMessage[];
    setMessageHistory: Dispatch<SetStateAction<ChatMessage[]>>;
    setIsFullScreen: (value: React.SetStateAction<boolean>) => void;
    setSessionId: React.Dispatch<React.SetStateAction<string>>;
    setIsChatSectionVisible: React.Dispatch<React.SetStateAction<boolean>>;
    setVariableOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onReload: () => void;
    draftVersion: number | null;
    isDraft: boolean | undefined;
}

export interface ChatbotRef {
    clearMessages: () => void;
}

interface FileViewerProps {
    index: number;
    file: IFile;
    removeFile?: (index: number) => void;
}

// const toggleItems = [
//     { value: 'Chat', label: 'Chat', icon: <MessageSquare size={16} /> },
//     { value: 'Video', label: 'Video', icon: <Video size={16} /> },
// ];

const FileViewer = (props: FileViewerProps) => (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm transition-all">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                {/\.(xlsx|xls|csv)$/i.exec(props.file.name) ? (
                    <FileSpreadsheet size={16} className="text-blue-500 dark:text-blue-300" />
                ) : (
                    <File size={16} className="text-blue-500 dark:text-blue-300" />
                )}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate">{props.file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(props.file.size)}</p>
            </div>
        </div>
        {props?.removeFile && (
            <button
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                onClick={() => props.removeFile?.(props.index)}
            >
                <X size={14} />
            </button>
        )}
    </div>
);

export const Chatbot = forwardRef<ChatbotRef, ChatbotProps>((props, ref) => {
    const {
        apiConfigData,
        isFullScreen,
        isMobile,
        isChatSectionVisible,
        setIsFullScreen,
        setIsChatSectionVisible,
        setVariableOpen,
    } = props;

    const {
        chatSectionRef,
        chatContainerRef,
        fileInputRef,
        chatMessages,
        selectedApiCallAction,
        isMessageResponseLoading,
        selectedFiles,
        userMessage,
        calculateRows,
        isStreaming,
        setChatMessages,
        setUserMessage,
        handleKeyDown,
        handleReload,
        removeFile,
        handleFileChange,
        handleSendMessage,
    } = useChatbot(props);

    const [chatMode, setChatMode] = useState(ChatType.CHAT.valueOf());
    useImperativeHandle(ref, () => ({
        clearMessages: () => {
            setChatMessages([]);
        },
    }));

    return (
        <div
            ref={chatSectionRef}
            className={`col-span-12 md:col-span-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 ${
                isChatSectionVisible ? '' : 'hidden'
            } ${isFullScreen ? 'fixed top-0 left-0 w-screen h-screen z-50' : ''}`}
        >
            <div className="col-span-6 border-gray-200 dark:border-gray-700 rounded-md flex flex-col h-full">
                <div className="flex items-center justify-between gap-x-2">
                    {/* Commented out as it may be useful in the future for reference. */}
                    {/* <ToggleGroup
                        type="single"
                        defaultValue={chatMode}
                        items={toggleItems}
                        onValueChange={setChatMode}
                    ></ToggleGroup> */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="chat-mode"
                            defaultChecked={true}
                            checked={chatMode === ChatType.CHAT}
                            onCheckedChange={checked => setChatMode(checked ? ChatType.CHAT : ChatType.VIDEO)}
                        />
                        <Label htmlFor="chat-mode">{chatMode === ChatType.CHAT ? 'Chat' : 'Video'}</Label>
                    </div>
                    <span className="flex gap-x-3">
                        {isMobile && (
                            <Code
                                className="cursor-pointer"
                                onClick={() => {
                                    setIsChatSectionVisible(!isChatSectionVisible);
                                }}
                                size={20}
                            />
                        )}
                        <Variable className="cursor-pointer" size={20} onClick={() => setVariableOpen(true)} />
                        <RefreshCcw className="cursor-pointer" onClick={handleReload} size={20} />
                        {isFullScreen ? (
                            <Minimize
                                className="cursor-pointer"
                                size={20}
                                onClick={() => setIsFullScreen(!isFullScreen)}
                            />
                        ) : (
                            <Maximize
                                className="cursor-pointer"
                                size={20}
                                onClick={() => setIsFullScreen(!isFullScreen)}
                            />
                        )}
                    </span>
                </div>

                {chatMode === ChatType.CHAT && (
                    <>
                        <div
                            ref={chatContainerRef}
                            className={cn(
                                'flex flex-col flex-1 max-h-[50vh] overflow-y-auto border-b border-gray-300 dark:border-gray-600 p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600',
                                {
                                    'flex-grow h-full max-h-screen w-2/3 mx-auto': isFullScreen,
                                }
                            )}
                        >
                            {chatMessages?.length > 0 ? (
                                <>
                                    {chatMessages?.map(
                                        (msg, index) =>
                                            (msg?.text?.length > 0 || (msg?.file && msg?.file?.length > 0)) && (
                                                <div key={msg.id ?? `msg-${index}-${msg.timestamp ?? ''}`} className="flex flex-col gap-2">
                                                    <div
                                                        className={`relative px-4 py-3 rounded-2xl text-sm shadow-lg flex flex-col gap-1 transition-all duration-300 ease-in-out ${
                                                            msg.sender === 'user'
                                                                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white self-end ml-auto max-w-[80%] sm:max-w-max break-words whitespace-normal overflow-hidden left-box'
                                                                : '!max-w-[95%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 self-start mr-auto sm:max-w-max break-words whitespace-normal overflow-hidden'
                                                        }`}
                                                    >
                                                        <div className="[&>p]:my-1 [&>li]:my-1 leading-snug">
                                                            <MarkdownText apiCallAction={selectedApiCallAction}>
                                                                {msg.text}
                                                            </MarkdownText>
                                                            {msg.sender !== 'bot' &&
                                                                msg?.file &&
                                                                msg?.file?.length > 0 &&
                                                                msg?.file?.map((file, fileIdx) => (
                                                                    <FileViewer key={file.name ? `${file.name}-${file.size ?? 0}` : `file-${fileIdx}`} file={file} index={fileIdx} />
                                                                ))}
                                                        </div>
                                                    </div>
                                                    <small
                                                        className={`text-xs px-2 text-gray-400 dark:text-gray-500 text-right ${
                                                            msg.sender === 'user'
                                                                ? 'self-end ml-auto'
                                                                : 'self-start mr-auto'
                                                        }`}
                                                    >
                                                        {msg.timestamp}
                                                    </small>
                                                </div>
                                            )
                                    )}

                                    {isMessageResponseLoading && (
                                        <div
                                            className={`relative px-4 py-3 rounded-2xl text-sm max-w-[10%] md:max-w-[10%] self-start before:absolute before:left-0 before:bottom-0 before:w-3 before:h-3 before:rounded-bl-sm`}
                                        >
                                            <div className="flex items-center justify-center space-x-2 py-1">
                                                <div className="w-1 h-1 p-[3px] mx-0 bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce"></div>
                                                <div className="w-1 h-1 p-[3px] mx-0 bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce animation-delay-300"></div>
                                                <div className="w-1 h-1 p-[3px] mx-0 bg-gray-400 dark:bg-gray-100 rounded-full animate-bounce animation-delay-600"></div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p
                                    className={cn('text-gray-500 dark:text-gray-400 text-sm text-center', {
                                        'py-[14vh]': selectedFiles && selectedFiles?.length > 0,
                                        'py-[20vh]': !selectedFiles || selectedFiles?.length === 0,
                                    })}
                                >
                                    No messages yet
                                </p>
                            )}
                            {selectedFiles && selectedFiles.length > 0 && (
                                <div
                                    className={cn('mb-4 min-h-[10vh]', {
                                        '!mt-auto': chatMessages?.length > 0,
                                    })}
                                >
                                    <div className="border rounded-lg p-3 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-3">
                                            Uploaded Files
                                        </p>

                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <FileViewer
                                                    key={`${file.name}-${file.size ?? 0}-${index}`}
                                                    file={file}
                                                    index={index}
                                                    removeFile={removeFile}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <div
                                className={cn('flex items-center gap-2 mt-2 bottom-0', {
                                    'w-2/3 mx-auto': isFullScreen,
                                })}
                            >
                                <Textarea
                                    placeholder="Type your message..."
                                    value={userMessage}
                                    rows={calculateRows}
                                    onChange={e => setUserMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 resize-none"
                                />
                                <label
                                    className={cn(
                                        'w-max antialiased cursor-pointer disabled:cursor-auto inline-flex justify-center items-center gap-x-2 rounded-lg font-semibold transition-all duration-50 ease-in-out bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-300 drop-shadow-sm outline-none focus:ring-2 focus:outline-none focus:ring-gray-200 disabled:bg-white disabled:border-gray-200 disabled:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-700 dark:disabled:border-gray-700 dark:disabled:text-gray-600 dark:focus:ring-gray-500 h-10 px-4 py-[10px] text-sm',
                                        {
                                            'opacity-80': !apiConfigData,
                                        }
                                    )}
                                >
                                    <span className="sr-only">Attach a file</span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv,.txt"
                                        className="hidden"
                                        disabled={!apiConfigData}
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <Paperclip size={16} className={cn({ 'opacity-80': !apiConfigData })} />
                                </label>
                                <Button
                                    onClick={handleSendMessage}
                                    variant="primary"
                                    disabled={
                                        !apiConfigData ||
                                        isMessageResponseLoading ||
                                        (userMessage.length === 0 && (!selectedFiles || selectedFiles.length === 0)) ||
                                        isStreaming
                                    }
                                >
                                    <Send size={16} />
                                </Button>
                            </div>
                            <div className={cn('mt-2 ml-1', { 'w-2/3 mx-auto': isFullScreen })}>
                                <code>Shift + Enter for new line</code>
                            </div>
                        </div>
                    </>
                )}
                {chatMode === ChatType.VIDEO && (
                    <DailyProvider>
                        <VideoWindow currentGenerateMethod={props.currentGenerateMethod} apiKey={props.apiKey} />
                    </DailyProvider>
                )}
            </div>
        </div>
    );
});

Chatbot.displayName = 'Chatbot';
