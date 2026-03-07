import { LearningSourceType } from '@/enums';
import { ILearningOption } from '@/models';

export const LEARNING_LIST: ILearningOption[] = [
    {
        source: LearningSourceType.LearnFromSummary,
        title: 'Learn From Summary',
        description: 'Summarize all feedback into one concise learning input for the Agent.',
    },
    {
        source: LearningSourceType.LearnFromAllFeedback,
        title: 'Learn From All Feedback',
        description: 'Feed every individual feedback entry directly into the Agent with no summarization.',
    },
    {
        source: LearningSourceType.SmartFeedbackSearch,
        title: 'Smart Feedback Search',
        description: 'Use smart search to retrieve and use only the most relevant feedback.',
    },
];
