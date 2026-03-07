'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCheck, Search, CheckCircle2 } from 'lucide-react';

export default function DocumentEvaluation() {
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);

    // Progress the evaluation - run only once
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setCompleted(true);
                    return 100;
                }
                return prev + 20;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="flex flex-col items-center justify-center p-4 h-[200px]">
            <div className="relative flex flex-col items-center">
                {/* Document base - hidden when completed */}
                <AnimatePresence>
                    {!completed && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0 }}
                            className="text-gray-200"
                        >
                            <ClipboardCheck size={80} strokeWidth={1.5} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completion effect */}
                {completed && (
                    <motion.div
                        className="text-green-500"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
                        transition={{ duration: 0.5 }}
                    >
                        <CheckCircle2 size={80} strokeWidth={1.5} />
                    </motion.div>
                )}

                {/* Scanning effect */}
                {!completed && (
                    <motion.div
                        className="absolute text-blue-500"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{
                            y: [0, 60, 0],
                            opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                            repeat: !completed ? Number.POSITIVE_INFINITY : 0,
                            duration: 2,
                            repeatType: 'loop',
                        }}
                    >
                        <Search size={24} strokeWidth={2} />
                    </motion.div>
                )}

                {/* Progress indicators */}
                <div className="mt-6 w-64">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: 'spring', stiffness: 60 }}
                        />
                    </div>

                    <div className="mt-2 flex justify-between">
                        {[0, 1, 2, 3, 4].map(step => (
                            <motion.div
                                key={step}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: progress >= step * 25 ? 1 : 0,
                                    opacity: progress >= step * 25 ? 1 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 200, delay: step * 0.1 }}
                                className="text-blue-500"
                            >
                                <CheckCircle2 size={20} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Status text */}
                <motion.div className="mt-4 font-medium text-md" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
                    {completed ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-200">
                            Evaluation Complete
                        </motion.span>
                    ) : (
                        <motion.span className="text-gray-200">Evaluating Dataset... {progress}%</motion.span>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
