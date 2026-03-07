'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { getSecureRandom } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../../components/atoms/dialog';
import { Button, Input, ScrollArea } from '../../../../../../components/atoms';

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
}

interface Chunk {
    id: string;
    content: string;
    relevanceScore: number;
}

interface RAGModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Enhanced knowledge base with categorized chunks
const knowledgeBase = [
    {
        id: 'ml-1',
        content:
            'Machine learning algorithms require large datasets to train effectively and produce accurate results. The quality of data directly impacts model performance.',
        category: 'machine-learning',
    },
    {
        id: 'ml-2',
        content:
            'Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.',
        category: 'machine-learning',
    },
    {
        id: 'ml-3',
        content:
            'Neural networks are inspired by biological neurons and consist of interconnected layers that process information.',
        category: 'machine-learning',
    },
    {
        id: 'react-1',
        content:
            'React is a JavaScript library for building user interfaces, particularly web applications. It uses a component-based architecture.',
        category: 'react',
    },
    {
        id: 'react-2',
        content:
            'React hooks like useState and useEffect allow functional components to manage state and side effects.',
        category: 'react',
    },
    {
        id: 'react-3',
        content:
            'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React components.',
        category: 'react',
    },
    {
        id: 'db-1',
        content:
            'Database indexing improves query performance by creating efficient data access paths and reducing search time.',
        category: 'database',
    },
    {
        id: 'db-2',
        content:
            'SQL databases use structured query language for data manipulation, while NoSQL databases offer flexible schema designs.',
        category: 'database',
    },
    {
        id: 'db-3',
        content:
            'Database normalization reduces data redundancy and improves data integrity through proper table design.',
        category: 'database',
    },
    {
        id: 'ai-1',
        content:
            'Artificial intelligence encompasses machine learning, deep learning, and neural networks to simulate human intelligence.',
        category: 'artificial-intelligence',
    },
    {
        id: 'ai-2',
        content:
            'Natural language processing involves teaching computers to understand and generate human language effectively.',
        category: 'artificial-intelligence',
    },
    {
        id: 'ai-3',
        content:
            'Computer vision enables machines to interpret and understand visual information from the world around them.',
        category: 'artificial-intelligence',
    },
    {
        id: 'web-1',
        content:
            'Web development involves frontend technologies like HTML, CSS, and JavaScript for creating user interfaces.',
        category: 'web-development',
    },
    {
        id: 'web-2',
        content: 'Responsive design ensures websites work well across different device sizes and screen resolutions.',
        category: 'web-development',
    },
    {
        id: 'web-3',
        content: 'API design focuses on creating intuitive interfaces for system communication and data exchange.',
        category: 'web-development',
    },
];

// Predefined messages with their mapped chunks
const predefinedQueries = {
    'How does machine learning work?': {
        chunks: ['ml-1', 'ml-2', 'ml-3'],
        context: 'User is asking about machine learning fundamentals and how ML algorithms function.',
    },
    'What is React?': {
        chunks: ['react-1', 'react-2', 'react-3'],
        context: 'User wants to understand React library, its features, and how it works.',
    },
    'Tell me about databases': {
        chunks: ['db-1', 'db-2', 'db-3'],
        context: 'User is inquiring about database concepts, types, and optimization techniques.',
    },
    'What is artificial intelligence?': {
        chunks: ['ai-1', 'ai-2', 'ai-3'],
        context: 'User is asking about AI concepts, applications, and related technologies.',
    },
    'How do I build websites?': {
        chunks: ['web-1', 'web-2', 'web-3'],
        context: 'User wants to learn about web development technologies and best practices.',
    },
    'Explain neural networks': {
        chunks: ['ml-3', 'ai-1', 'ai-2'],
        context: 'User is specifically interested in neural networks and their applications in AI.',
    },
    'What are React hooks?': {
        chunks: ['react-2', 'react-1', 'react-3'],
        context: 'User wants to understand React hooks and modern React development patterns.',
    },
    'Database optimization tips': {
        chunks: ['db-1', 'db-3', 'db-2'],
        context: 'User is looking for ways to optimize database performance and design.',
    },
};

// Enhanced chunk retrieval with predefined mappings
const retrieveRelevantChunks = (message: string): { chunks: Chunk[]; matchedQuery: string | null } => {
    const messageLower = message.toLowerCase().trim();

    // First, check for exact or close matches with predefined queries
    for (const [predefinedQuery, mapping] of Object.entries(predefinedQueries)) {
        const queryLower = predefinedQuery.toLowerCase();

        // Check for exact match or high similarity
        if (
            messageLower === queryLower ||
            messageLower.includes(queryLower.slice(0, -1)) ||
            queryLower.includes(messageLower)
        ) {
            const relevantChunks = mapping.chunks
                .map((chunkId, index) => {
                    const chunk = knowledgeBase.find(kb => kb.id === chunkId);
                    return {
                        id: chunkId,
                        content: chunk?.content ?? '',
                        relevanceScore: 1.0 - index * 0.1, // Decreasing relevance score
                    };
                })
                .filter(chunk => chunk.content !== '');

            return { chunks: relevantChunks, matchedQuery: predefinedQuery };
        }
    }

    // Fallback to keyword-based matching for non-predefined queries
    const keywords = messageLower.split(' ').filter(word => word.length > 2);

    const scoredChunks = knowledgeBase.map(chunk => {
        const chunkLower = chunk.content.toLowerCase();
        let score = 0;

        keywords.forEach(keyword => {
            if (chunkLower.includes(keyword)) {
                score += 1;
            }
        });

        // Add category bonus if message relates to category
        if (keywords.some(keyword => chunk.category.includes(keyword.replace('-', '')))) {
            score += 0.5;
        }

        return {
            id: chunk.id,
            content: chunk.content,
            relevanceScore: score + getSecureRandom() * 0.3,
        };
    });

    const filteredChunks = scoredChunks
        .filter(chunk => chunk.relevanceScore > 0.3)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 4);

    return { chunks: filteredChunks, matchedQuery: null };
};

// interface QuerySuggestionsProps {
//     onSelectQuery: (query: string) => void;
// }

// function QuerySuggestions({ onSelectQuery }: QuerySuggestionsProps) {
//     const suggestions = Object.keys(predefinedQueries);

//     return (
//         <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
//             <h4 className="font-medium mb-3 text-sm text-gray-700">💡 Try these predefined queries:</h4>
//             <div className="flex flex-wrap gap-2">
//                 {suggestions.map(query => (
//                     <Button
//                         key={query}
//                         variant="outline"
//                         size="sm"
//                         onClick={() => onSelectQuery(query)}
//                         className="text-xs h-8 px-3 rounded-lg border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
//                     >
//                         {query}
//                     </Button>
//                 ))}
//             </div>
//         </div>
//     );
// }

export function RAGModal({ isOpen, onClose }: Readonly<RAGModalProps>) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'user',
            content: 'How does machine learning work?',
            timestamp: new Date(Date.now() - 300000),
        },
        {
            id: '2',
            role: 'bot',
            content:
                'Machine learning works by training algorithms on data to recognize patterns and make predictions. It requires large datasets and computational resources.',
            timestamp: new Date(Date.now() - 240000),
        },
    ]);

    const [retrievedChunks, setRetrievedChunks] = useState<Chunk[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [context, setContext] = useState(
        'Previous conversation context about machine learning and AI systems. User asked about RAG configurations and retrieval mechanisms.'
    );
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    // Initialize with chunks for the last message
    useEffect(() => {
        if (messages.length > 0) {
            const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
            if (lastUserMessage) {
                const { chunks } = retrieveRelevantChunks(lastUserMessage.content);
                setRetrievedChunks(chunks);
            }
        }
    }, []);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userInput = inputMessage.trim();
        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userInput,
            timestamp: new Date(),
        };

        // Add user message immediately and clear input
        setMessages(prev => [...prev, newUserMessage]);
        setInputMessage('');
        setIsLoading(true);

        // Retrieve relevant chunks for the new message
        const { chunks, matchedQuery } = retrieveRelevantChunks(userInput);
        setRetrievedChunks(chunks);

        // Enhanced bot response based on whether we matched a predefined query
        let botContent = '';
        if (matchedQuery) {
            const queryMapping = predefinedQueries[matchedQuery as keyof typeof predefinedQueries];
            botContent = `I found a perfect match for your question "${matchedQuery}". Based on ${chunks.length} highly relevant chunks from my knowledge base, I can provide you with comprehensive information about this topic.`;
            setContext(queryMapping.context);
        } else {
            botContent = `I found ${chunks.length} relevant chunks for "${userInput}". Let me provide information based on the available knowledge.`;
            setContext(
                `Custom query: User asked about "${userInput}". Retrieved ${chunks.length} chunks using keyword matching.`
            );
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        // Start streaming response
        setIsStreaming(true);
        setStreamingMessage('');

        // Simulate streaming by adding characters progressively
        for (let i = 0; i <= botContent.length; i++) {
            setStreamingMessage(botContent.slice(0, i));
            await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Add complete bot message and clear streaming
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'bot',
            content: botContent,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, botResponse]);
        setIsStreaming(false);
        setStreamingMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClose = () => {
        setMessages([
            {
                id: '1',
                role: 'user',
                content: 'How does machine learning work?',
                timestamp: new Date(Date.now() - 300000),
            },
            {
                id: '2',
                role: 'bot',
                content:
                    'Machine learning works by training algorithms on data to recognize patterns and make predictions. It requires large datasets and computational resources.',
                timestamp: new Date(Date.now() - 240000),
            },
        ]);
        setRetrievedChunks([
            {
                id: 'ml-1',
                content:
                    'Machine learning algorithms require large datasets to train effectively and produce accurate results. The quality of data directly impacts model performance.',
                relevanceScore: 1,
            },
            {
                id: 'ml-2',
                content:
                    'Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.',
                relevanceScore: 0.9,
            },
            {
                id: 'ml-3',
                content:
                    'Neural networks are inspired by biological neurons and consist of interconnected layers that process information.',
                relevanceScore: 0.8,
            },
        ]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 gap-0 overflow-hidden">
                <DialogHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold text-gray-800">RAG System Simulation</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="flex p-4 gap-4 overflow-hidden">
                    {/* Retrieved Chunks Section */}
                    <div className="flex-1 border rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-gray-800">Retrieved Chunks</h3>
                            {(() => {
                                if (isLoading) {
                                    return (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium animate-pulse">
                                            Searching...
                                        </span>
                                    );
                                }
                                if (retrievedChunks.length > 0) {
                                    return (
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                                            {retrievedChunks.length} chunks found
                                        </span>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                        <ScrollArea className="pr-2 overflow-hidden">
                            <div className="space-y-3">
                                {(() => {
                                    if (isLoading) {
                                        return (
                                    <>
                                        {[1, 2, 3].map(index => (
                                            <div
                                                key={`loading-${index}`}
                                                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm animate-pulse"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="h-6 bg-gray-200 rounded-md w-20"></div>
                                                    <div className="h-4 bg-gray-200 rounded-full w-12"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center py-4">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Retrieving relevant chunks...
                                            </div>
                                        </div>
                                    </>
                                        );
                                    }
                                    if (retrievedChunks.length > 0) {
                                        return retrievedChunks.map((chunk, index) => (
                                        <div
                                            key={chunk.id}
                                            className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                    Chunk {index + 1}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {chunk.relevanceScore.toFixed(2)}
                                                    </span>
                                                    {chunk.relevanceScore >= 0.9 && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                            High Match
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed">{chunk.content}</p>
                                        </div>
                                    ));
                                    }
                                    return (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Send className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm mb-2 font-medium">
                                            No chunks retrieved yet
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            Send a message or try a predefined query to see relevant chunks.
                                        </p>
                                    </div>
                                    );
                                })()}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right Side - Context and Chat */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* Context Section */}
                        <div className="border rounded-xl p-4 h-32 bg-white shadow-sm">
                            <h3 className="font-semibold mb-3 text-lg text-gray-800">Context</h3>
                            <ScrollArea className="h-20">
                                <p className="text-sm text-gray-700 leading-relaxed">{context}</p>
                            </ScrollArea>
                        </div>

                        {/* Chat History Section */}
                        <div className="border rounded-xl p-4 flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-sm min-h-0">
                            <h3 className="font-semibold mb-4 text-lg text-gray-800">Chat History</h3>

                            <div
                                className="fl mb-4 h-[400px] overflow-y-auto"
                                ref={ref => {
                                    if (ref && (messages.length > 0 || isStreaming)) {
                                        const scrollContainer = ref.querySelector('[data-radix-scroll-area-viewport]');
                                        if (scrollContainer) {
                                            setTimeout(() => {
                                                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                                            }, 50);
                                        }
                                    }
                                }}
                            >
                                <div className="space-y-4 pr-2">
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`flex ${
                                                message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[85%] p-4 rounded-2xl shadow-sm transition-all duration-300 ${
                                                    message.role === 'user'
                                                        ? 'bg-blue-600 text-white rounded-br-md'
                                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className={`font-medium text-xs ${
                                                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {message.role === 'user' ? 'You' : 'Assistant'}
                                                    </span>
                                                    <span
                                                        className={`text-xs ${
                                                            message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                                                        }`}
                                                    >
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Loading indicator */}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-xs text-gray-500">Assistant</span>
                                                    <span className="text-xs text-gray-400">typing...</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.1s' }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                        style={{ animationDelay: '0.2s' }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Streaming message */}
                                    {isStreaming && streamingMessage && (
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-xs text-gray-500">Assistant</span>
                                                    <span className="text-xs text-gray-400">streaming...</span>
                                                </div>
                                                <p className="text-sm leading-relaxed">
                                                    {streamingMessage}
                                                    <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse"></span>
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Input */}
                            <div className="flex gap-3 pt-3 border-t border-gray-200">
                                <Input
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message here..."
                                    className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isLoading || isStreaming}
                                    size="icon"
                                    className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg h-10 w-10 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                >
                                    {isLoading || isStreaming ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
