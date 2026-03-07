'use client';
import React, { useRef, useState } from 'react';
import { Copy, Mic, Square, MicOff, Info, Eye, EyeOff } from 'lucide-react';
import config from '@/config/environment-variables';

interface VoiceWorkflowPlaygroundProps {
  workFlowId: string;
  openVoiceWorkflowPlayground: boolean;
  setOpenVoiceWorkflowPlayground: React.Dispatch<React.SetStateAction<boolean>>;
}

interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export const VoiceWorkflowPlayground = ({
  workFlowId,
  openVoiceWorkflowPlayground,
  setOpenVoiceWorkflowPlayground
}: VoiceWorkflowPlaygroundProps) => {
  const [isCall, setIsCall] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [notification, setNotification] = useState('');
  const [authCompleted, setAuthCompleted] = useState(false);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const isMicMutedRef = useRef(false);
  const streamSidRef = useRef<string>('');
  const nextPlaybackTimeRef = useRef(0);

  const WORKFLOW_ID = workFlowId;
  const wsUrl = config.NEXT_PUBLIC_WS_URL;
  
  // Placeholder API key for UI display
  const placeholderApiKey = '••••••••••••••••••••••••••••••••••••••••••••••••';

  const curlCommand = `wscat -c "${wsUrl}?workflow_id=${WORKFLOW_ID}&to=%2B1234567890&from=%2B0987654321&pipelineType=STS&stsInputFormat=audio/pcmu&stsOutputFormat=audio/pcmu"`;

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(placeholderApiKey);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
  };

  const startCall = async () => {
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        
        streamSidRef.current = 'stream_' + crypto.randomUUID().replace(/-/g, '').slice(0, 9);
        const callSid = 'CA' + crypto.randomUUID().replace(/-/g, '').slice(0, 32);

        const startEvent = {
          event: 'start',
          start: {
            streamSid: streamSidRef.current,
            callSid: callSid,
            customParameters: {
              workflow_id: WORKFLOW_ID,
              to: '+1234567890',
              from: '+0987654321',
              pipelineType: 'STS',
              stsInputFormat: 'audio/pcmu',
              stsOutputFormat: 'audio/pcmu'
            }
          }
        };

        wsRef.current?.send(JSON.stringify(startEvent));
        setIsCall(true);
        setNotification("You're now connected!");
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.event === 'media' && data.media?.payload) {
            const audioBuffer = await ulawToAudioBuffer(data.media.payload);
            audioQueueRef.current.push(audioBuffer);
            if (!isPlayingRef.current) {
              playAudioQueue();
            }
          } else if (data.event === 'clear') {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            nextPlaybackTimeRef.current = 0;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsCall(false);
        setNotification('');
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setNotification('Connection error occurred');
      };

      audioContextRef.current = new (
        window.AudioContext || 
        (window as WindowWithWebkit).webkitAudioContext
      )({ sampleRate: 8000 });

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 8000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      processorRef.current.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (isMicMutedRef.current) return;

        const inputBuffer = e.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        const ulawData = new Uint8Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const linearSample = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          ulawData[i] = linearToUlaw(linearSample);
        }

        let binary = '';
        for (const sample of ulawData) {
          binary += String.fromCharCode(sample);
        }
        const base64Audio = btoa(binary);

        wsRef.current?.send(JSON.stringify({
          event: 'media',
          media: {
            payload: base64Audio,
            timestamp: Date.now().toString()
          },
          streamSid: streamSidRef.current
        }));
      };

    } catch (error) {
      console.error('Error starting call:', error);
      setNotification('Failed to start call');
    }
  };

  const stopCall = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        event: 'stop',
        streamSid: streamSidRef.current
      }));
      wsRef.current.close();
    }
    
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    nextPlaybackTimeRef.current = 0;
    
    setIsCall(false);
    setNotification('');
  };

  const toggleMicMute = () => {
    setIsMicMuted((prev) => {
      const newValue = !prev;
      isMicMutedRef.current = newValue;
      return newValue;
    });
  };

  const linearToUlaw = (sample: number): number => {
    const CLIP = 32635;
    const sign = (sample >> 8) & 0x80;
    if (sign !== 0) sample = -sample;
    if (sample > CLIP) sample = CLIP;
    sample += 0x84;
    
    let exponent = 7;
    for (let expMask = 0x4000; (sample & expMask) === 0 && exponent > 0; exponent--, expMask >>= 1) {
        /* Intentional: find leading zero count for exponent */
    }
    
    const mantissa = (sample >> (exponent + 3)) & 0x0f;
    const ulawByte = ~(sign | (exponent << 4) | mantissa);
    return ulawByte & 0xFF;
  };

  const ulawToLinear = (ulawByte: number): number => {
    ulawByte = ~ulawByte;
    const sign = ulawByte & 0x80;
    const exponent = (ulawByte >> 4) & 0x07;
    const mantissa = ulawByte & 0x0f;
    
    let sample = mantissa << (exponent + 3);
    if (exponent !== 0) sample += 0x84 << exponent;
    if (sign !== 0) sample = -sample;
    
    return sample;
  };

  const ulawToAudioBuffer = async (base64Audio: string): Promise<AudioBuffer> => {
    const binaryString = atob(base64Audio);
    const ulawBytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      ulawBytes[i] = binaryString.charCodeAt(i);
    }

    const audioBuffer = audioContextRef.current!.createBuffer(1, ulawBytes.length, 8000);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < ulawBytes.length; i++) {
      const linearSample = ulawToLinear(ulawBytes[i]);
      channelData[i] = linearSample / 32768.0;
    }

    return audioBuffer;
  };

  const playAudioQueue = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const bufferToPlay = audioQueueRef.current.shift()!;
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(audioContextRef.current!.destination);

    const currentTime = audioContextRef.current!.currentTime;
    if (nextPlaybackTimeRef.current < currentTime) {
      nextPlaybackTimeRef.current = currentTime;
    }

    source.start(nextPlaybackTimeRef.current);
    nextPlaybackTimeRef.current += bufferToPlay.duration;
    source.onended = playAudioQueue;
  };

  const testAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (
          window.AudioContext || 
          (window as WindowWithWebkit).webkitAudioContext
        )({ sampleRate: 8000 });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 1.0);
      
      console.log('🔊 Playing test tone...');
    } catch (error) {
      console.error('Error playing test audio:', error);
    }
  };

  if (!openVoiceWorkflowPlayground) return null;

  return (
    <div className="fixed inset-0 z-[100010] flex items-end">
      <div className="bg-white dark:bg-gray-900 w-full h-[90vh] rounded-t-lg overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Voice Workflow Config</h2>
            </div>
            <button 
              onClick={() => setOpenVoiceWorkflowPlayground(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Left Panel */}
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 h-[calc(90vh-120px)] overflow-y-auto">
              {!authCompleted ? (
                <div className="flex flex-col gap-y-4">
                  <h3 className="text-md font-semibold mb-2">
                    Generate API key to test out the workflow
                  </h3>
                  <div className="flex items-center justify-between p-4 border rounded-md bg-white dark:bg-gray-900">
                    <div className="flex items-center space-x-2">
                      <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          API Key Authentication
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use an Application Token to securely authenticate API requests.
                        </p>
                      </div>
                    </div>

                    <button
                      className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs sm:text-sm"
                      disabled={isApiKeyLoading}
                      onClick={() => {
                        setIsApiKeyLoading(true);
                        setTimeout(() => {
                          setAuthCompleted(true);
                          setIsApiKeyLoading(false);
                        }, 800);
                      }}
                    >
                      {isApiKeyLoading ? 'Loading...' : 'Continue with API Key'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* API Key Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="voice-playground-api-key" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        API KEY
                      </label>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-900 rounded border border-gray-700">
                      <input
                        id="voice-playground-api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={placeholderApiKey}
                        readOnly
                        className="flex-1 bg-transparent text-white text-sm font-mono outline-none"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>

                  {/* cURL Section */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="voice-playground-curl" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        cURL
                      </label>
                      <button
                        onClick={handleCopyCurl}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <textarea
                      id="voice-playground-curl"
                      readOnly
                      value={curlCommand}
                      className="w-full h-[calc(90vh-320px)] text-sm font-mono bg-gray-900 text-green-400 p-3 rounded border border-gray-700 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Voicebot */}
            <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 flex flex-col relative h-[calc(90vh-120px)]">
              <div className="absolute top-4 left-4">
                <h3 className="text-md font-semibold">Voicebot</h3>
              </div>

              <div className="flex flex-col flex-1 justify-center items-center text-center">
                {!isCall && !notification && (
                  <p className="mb-6 text-gray-500 dark:text-gray-400 text-sm">
                    You haven&apos;t hit into the voicebot yet.<br />
                    Please click on &quot;start button&quot; to get started
                  </p>
                )}

                {notification && (
                  <p className="mb-6 text-gray-800 dark:text-gray-100 text-lg font-medium">
                    {notification}
                  </p>
                )}

                {!isCall ? (
                   <div className="flex flex-col gap-3">
                    <button 
                      onClick={startCall}
                      className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base font-medium"
                    >
                      <Mic size={18} /> Start Call
                    </button>
                    
                    <button 
                      onClick={testAudio}
                      className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 bg-green-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm sm:text-base font-medium"
                    >
                     <i className="ri-volume-up-fill text-lg" /> Test Audio
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <button 
                      onClick={stopCall}
                      className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm sm:text-base font-medium"
                    >
                      <Square size={18} /> End Call
                    </button>

                    <button
                      onClick={toggleMicMute}
                      className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base font-medium ${
                        isMicMuted 
                          ? 'bg-gray-600 hover:bg-gray-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                      {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};