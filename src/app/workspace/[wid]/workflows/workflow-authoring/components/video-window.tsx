'use client';

import React from 'react';
import { Button } from '@/components';
import { LoaderCircle, Mic, MicOff, Phone } from 'lucide-react';
import { useAvatarConfiguration } from '@/hooks/use-avatar-configuration';
import { DailyAudio, DailyVideo } from '@daily-co/daily-react';
import { GenerateMethod } from '@/hooks/use-workflow-execution';

export interface VideoWindowProps {
    currentGenerateMethod: GenerateMethod;
    apiKey: string;
}

export const VideoWindow = (props: VideoWindowProps) => {
    // const [isMuted, setIsMuted] = useState(false);
    const {
        isAvatarConnecting,
        isAvatarConnected,
        avatarConnectionError,
        avatarSessionId,
        isMuted,
        handleUserMicMute,
        handleAvatarConnect,
        handleAvatarDisconnect,
    } = useAvatarConfiguration();

    return (
        <div className="flex flex-col flex-1 min-h-[50vh] overflow-y-auto border-b border-gray-300 dark:border-gray-600 p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 overflow-hidden">
            {!isAvatarConnected ? (
                <div className="flex flex-col flex-1 items-center justify-center dark:bg-gray-900 rounded-lg">
                    <div className="text-center space-y-6 px-6">
                        <div className="space-y-2">
                            <p className="text-black dark:text-white text-sm font-medium">
                                Click Connect to start video mode with your avatar.
                            </p>
                            <p className="text-gray-400 text-sm">
                                Once connected, you will see your avatar come to life and interact in real time through
                                video mode.
                            </p>
                        </div>
                        {avatarConnectionError && (
                            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-200 text-sm">
                                {avatarConnectionError}
                            </div>
                        )}
                        <Button
                            onClick={() => handleAvatarConnect(props.currentGenerateMethod, props.apiKey)}
                            disabled={isAvatarConnecting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                        >
                            {isAvatarConnecting ? (
                                <>
                                    <LoaderCircle size={16} className="animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect'
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col flex-1 items-center justify-center dark:bg-gray-900 rounded-lg relative">
                    <DailyVideo
                        sessionId={avatarSessionId}
                        type={'video'}
                        fit="contain"
                        className={'w-full h-full object-cover rounded-md'}
                    />
                    <DailyAudio></DailyAudio>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        <Button
                            onClick={handleUserMicMute}
                            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors p-3 border-0 ${
                                isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'
                            } text-white`}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </Button>
                        <Button
                            onClick={handleAvatarDisconnect}
                            className="flex items-center justify-center w-10 h-10 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors p-3 border-0"
                        >
                            <Phone size={20} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
