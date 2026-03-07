// 'use client';

// import { Input, Label, Select } from '@/components';
// import { RagConfigSteps, RetrieverFormProps } from '../retriever-form';
// import { useEffect, useMemo, useState } from 'react';
// import { Controller } from 'react-hook-form';
// import { Switch } from '@/components/atoms/switch';
// import { cn, convertStringListToDropdown } from '@/lib/utils';

// import { RadioGroup, RadioGroupItem } from '@/components/atoms/radio-group';
// import { SwitchLabel } from './switch-label';
// import { grokkingDepthOptions, iterativeRetrievalMethodOptions, reRankingOptions } from '@/constants/rag-constants';

// import { useRagSettings } from '@/hooks/use-rag-settings';
// import { AlgorithmicRankingOptions, RagVariant, ReRankingType } from '@/models/rag-model';

// export const PostRetrievalStep = (props: RetrieverFormProps) => {
//     const {
//         register,
//         isEdit,
//         errors,
//         watch,
//         retriever,
//         currentRetriever,
//         control,
//         selectedSettings,
//         setValue,
//         isAdvancedMode,
//     } = props;
//     const { setXaiExplanationOptions, xaiExplanationOptions, setFeedbackIntegrationOptions } = useRagSettings();
//     const allInputSwicth: string[] = [
//         'isEnableReranking',
//         'isGrokking',
//         'isSummarizeLongContexts',
//         'isEnableCaching',
//         'isEnableExplainability',
//         'isEnableCorrectiveRAG',
//     ];
//     const [activeInputs, setActiveInputs] = useState<string[]>([]);

//     const isReadOnly = useMemo(() => {
//         return !!watch('isReadOnly');
//     }, [watch('isReadOnly')]);

//     const isCustomType = useMemo(() => {
//         return !watch('configurations.customRag');
//     }, [watch('configurations.customRag')]);

//     const isIterativeRag = useMemo(() => {
//         return watch('configurations.ragVariant') === RagVariant.ITERATIVE;
//     }, [watch('configurations.ragVariant')]);

//     const index = useMemo(() => {
//         return retriever?.findIndex(retriever => retriever?.id == currentRetriever);
//     }, [retriever, currentRetriever]);

//     useEffect(() => {
//         if (selectedSettings && isCustomType) {
//             const filteredFields =
//                 selectedSettings.displayFields?.filter(field => field.feature === RagConfigSteps.POST_RETRIEVAL) ?? [];

//             // Make sure to set the default value only on load, not during edit.
//             const isGrokRetrievalSettings = filteredFields?.some(field =>
//                 ['grokEpochs', 'grokRetrievalTopK', 'grokRetrievalTopK'].includes(field?.name)
//             );
//             const isEnableCorrectiveRAG = filteredFields?.some(field => ['maxCorrectionRounds'].includes(field?.name));
//             if (isGrokRetrievalSettings) {
//                 setValue(`configurations.retriever.${index}.isGrokking`, true);
//             }

//             const isCustom = watch('configurations.customRag') ?? false;

//             if (isCustom) {
//                 setActiveInputs(allInputSwicth);
//             } else {
//                 const active: string[] = [];

//                 if (isGrokRetrievalSettings) {
//                     active.push('isGrokking');
//                 }
//                 if (isEnableCorrectiveRAG) active.push('isEnableCorrectiveRAG');

//                 setActiveInputs(active);
//             }
//             filteredFields?.map(filed => {
//                 switch (filed?.name) {
//                     case 'xaiExplanationDepth':
//                         setValue(`configurations.retriever.${index}.isEnableExplainability`, true);
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.xaiExplanationDepth`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'grokEpochs':
//                         if (filed?.default)
//                             setValue(`configurations.retriever.${index}.grokEpochs`, (filed?.default as string) ?? '');
//                         break;
//                     case 'grokRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.grokRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;

//                     case 'xaiExplanationFormat':
//                         setValue(`configurations.retriever.${index}.isEnableExplainability`, true);
//                         setXaiExplanationOptions(convertStringListToDropdown(filed?.values ?? []) ?? []);
//                         setValue(
//                             `configurations.retriever.${index}.xaiExplanationFormat`,
//                             (filed?.default as string) ?? ''
//                         );
//                         break;
//                     case 'maxCorrectionRounds':
//                         setValue(`configurations.retriever.${index}.isEnableCorrectiveRAG`, true);
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.maxCorrectionRounds`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'correctionSimilarityThreshold':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.correctionSimilarityThreshold`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;

//                     case 'feedbackIntegrationMethod':
//                         setFeedbackIntegrationOptions(convertStringListToDropdown(filed?.values ?? []) ?? []);
//                         setValue(
//                             `configurations.retriever.${index}.feedbackIntegrationMethod`,
//                             (filed?.default as string) ?? ''
//                         );
//                         break;

//                     default:
//                         break;
//                 }
//             });
//         }
//     }, [selectedSettings]);
//     return (
//         <div className="flex flex-col gap-4">
//             <div className="bg-gray-100 border-[1px] border-gray-200 rounded-md p-3 dark:bg-gray-700 dark:border-gray-600">
//                 <p className="mb-1">Post Retrieval</p>
//                 <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
//                     After the snippets arrive, this view lets you tidy them up - ordering, trimming, explaining or
//                     caching results - so that the information is cleaner and easier to work with.
//                 </p>
//             </div>

//             {(isAdvancedMode || watch('configurations.ragVariant') === RagVariant.STANDARD) && index >= 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
//                     {/* Enable Reranking */}
//                     <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div
//                                 className={cn(
//                                     'col-span-12',
//                                     watch(`configurations.retriever.${index}.isEnableReranking`) &&
//                                         'pb-2 mb-1 border-b-[1px]'
//                                 )}
//                             >
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isEnableReranking`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <Label htmlFor="enable_reranking">Enable Reranking</Label>{' '}
//                                             <Switch
//                                                 id="enable_reranking"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={isEdit && isReadOnly}
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>

//                             {watch(`configurations.retriever.${index}.isEnableReranking`) && (
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.reRankingType`}
//                                         control={control}
//                                         render={({ field }) => (
//                                             <div className="flex flex-col items-start gap-y-3 w-full justify-start">
//                                                 <Label htmlFor="re_ranking_type">Re-ranking Type</Label>
//                                                 <RadioGroup
//                                                     value={field.value}
//                                                     onValueChange={value => {
//                                                         setValue(
//                                                             `configurations.retriever.${index}.reRankingType`,
//                                                             value as ReRankingType,
//                                                             {
//                                                                 shouldValidate: true,
//                                                                 shouldDirty: true,
//                                                                 shouldTouch: true,
//                                                             }
//                                                         );
//                                                     }}
//                                                     className="flex items-center gap-x-4"
//                                                 >
//                                                     {[
//                                                         {
//                                                             value: ReRankingType.ALGORITHMIC,
//                                                             label: 'Algorithmic Re-rankers',
//                                                         },
//                                                         { value: ReRankingType.MODELS, label: 'Re-ranker Models' },
//                                                     ].map(({ value, label }) => (
//                                                         <div
//                                                             key={value}
//                                                             className={cn(
//                                                                 'flex items-center space-x-2',
//                                                                 value == ReRankingType.MODELS && 'opacity-65'
//                                                             )}
//                                                         >
//                                                             <RadioGroupItem
//                                                                 value={value}
//                                                                 id={`re-ranking-${value}`}
//                                                                 disabled={value == ReRankingType.MODELS}
//                                                             />
//                                                             <SwitchLabel
//                                                                 htmlFor={`re-ranking-${value}`}
//                                                                 label={label}
//                                                             />
//                                                         </div>
//                                                     ))}
//                                                 </RadioGroup>
//                                             </div>
//                                         )}
//                                     />
//                                 </div>
//                             )}

//                             {watch(`configurations.retriever.${index}.reRankingType`) == ReRankingType.ALGORITHMIC && (
//                                 <div className="col-span-12">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.algorithmicReranker`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please select Re-ranker',
//                                             },
//                                         })}
//                                         placeholder="Select Re-ranker"
//                                         options={reRankingOptions}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.xaiExplanationFormat`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.xaiExplanationFormat
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.xaiExplanationFormat
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}

//                             {watch(`configurations.retriever.${index}.algorithmicReranker`) ==
//                                 AlgorithmicRankingOptions.BM25 && (
//                                 <div className="col-span-12 grid grid-cols-1 sm:grid-cols-12 gap-3 ">
//                                     {watch(`configurations.retriever.${index}.algorithmicReranker`) && (
//                                         <>
//                                             <div className="col-span-12 sm:col-span-6">
//                                                 <Input
//                                                     {...register(`configurations.retriever.${index}.BM25K1`, {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter K1',
//                                                         },
//                                                     })}
//                                                     label="K1"
//                                                     placeholder="Enter K1"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]?.BM25K1
//                                                             ?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]?.BM25K1
//                                                             ?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-12 sm:col-span-6">
//                                                 <Input
//                                                     {...register(`configurations.retriever.${index}.BM25B`, {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter B',
//                                                         },
//                                                     })}
//                                                     label="B"
//                                                     placeholder="Enter B"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]?.BM25B
//                                                             ?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]?.BM25B
//                                                             ?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             )}

//                             {watch(`configurations.retriever.${index}.algorithmicReranker`) ==
//                                 AlgorithmicRankingOptions.TF_IDF && (
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.subLinearTF`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full my-1">
//                                                 <Switch
//                                                     id="enable_reranking"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={isEdit && isReadOnly}
//                                                 />
//                                                 <div className="flex flex-col gap-y-1">
//                                                     <Label htmlFor="enable_reranking">Sub linear tf</Label>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     />
//                                 </div>
//                             )}

//                             {watch(`configurations.retriever.${index}.algorithmicReranker`) && (
//                                 <div className="col-span-12">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.scoreThreshold`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Score Threshold',
//                                             },
//                                         })}
//                                         label="Score Threshold"
//                                         placeholder="Enter Score Threshold"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.scoreThreshold
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.scoreThreshold?.message
//                                         }
//                                     />
//                                 </div>
//                             )}

//                             {/* {watch(`configurations.retriever.${index}.isEnableReranking`) && (
//                                 <div className="col-span-12">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.rerankingType`, {
//                                             required: { value: true, message: 'Please select Re-ranker' },
//                                         })}
//                                         label="Re-ranker"
//                                         placeholder="Select Re-ranker"
//                                         options={rerankingTypeOptions}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.rerankingType`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.rerankingType?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.rerankingType?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {watch(`configurations.retriever.${index}.rerankingType`) ==
//                                 RerankingType.CROSS_ENCODER && (
//                                 <div className="col-span-12">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.rerankingModel`, {
//                                             required: { value: true, message: 'Please select Re-ranking Model' },
//                                         })}
//                                         label="Re-ranking Model"
//                                         placeholder="Select Re-ranking Model"
//                                         options={rerankingTypeOptions}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.rerankingModel`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.rerankingModel
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.rerankingModel?.message
//                                         }
//                                     />
//                                 </div>
//                             )} */}
//                         </div>
//                     </div>
//                     {watch('configurations.ragVariant') !== RagVariant.STANDARD && (
//                         <div className="col-span-12 mt-2">
//                             <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.isEnableCorrectiveRAG`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full justify-between">
//                                                 <Label htmlFor="enable_reranking">Enable Corrective RAG</Label>
//                                                 <Switch
//                                                     id="enable_reranking"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={
//                                                         (isEdit && isReadOnly) ||
//                                                         (!activeInputs.includes('isEnableCorrectiveRAG') &&
//                                                             isCustomType)
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     />
//                                 </div>
//                                 {watch(`configurations.retriever.${index}.isEnableCorrectiveRAG`) && (
//                                     <>
//                                         <div className="col-span-12">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.maxCorrectionRounds`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Max corrective rounds',
//                                                     },
//                                                 })}
//                                                 label="Max corrective rounds"
//                                                 placeholder="Enter Max corrective rounds"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.maxCorrectionRounds?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.maxCorrectionRounds?.message
//                                                 }
//                                             />
//                                         </div>

//                                         {/* correctionSimilarityThreshold */}
//                                         <div className="col-span-12">
//                                             <Input
//                                                 {...register(
//                                                     `configurations.retriever.${index}.correctionSimilarityThreshold`,
//                                                     {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter Confidence Threshold',
//                                                         },
//                                                     }
//                                                 )}
//                                                 label="Confidence Threshold"
//                                                 placeholder="Enter Confidence Threshold"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.correctionSimilarityThreshold?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.correctionSimilarityThreshold?.message
//                                                 }
//                                             />
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                     {/* Grokking */}
//                     {watch('configurations.ragVariant') !== RagVariant.STANDARD && (
//                         <div className="col-span-12 mt-2">
//                             <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.isGrokking`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full justify-between">
//                                                 <div className="flex flex-col gap-y-1">
//                                                     <Label htmlFor="enable_reranking">Grokking</Label>
//                                                 </div>
//                                                 <Switch
//                                                     id="enable_reranking"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={
//                                                         (isEdit && isReadOnly) ||
//                                                         (!activeInputs.includes('isGrokking') && isCustomType)
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     />
//                                 </div>
//                                 {watch(`configurations.retriever.${index}.isGrokking`) && (
//                                     <>
//                                         <div className="col-span-12">
//                                             <Select
//                                                 {...register(`configurations.retriever.${index}.grokkingDepth`, {
//                                                     required: { value: true, message: 'Please select Re-ranker' },
//                                                 })}
//                                                 label="Grokking depth"
//                                                 placeholder="Select Grokking depth"
//                                                 options={grokkingDepthOptions}
//                                                 disabled={isEdit && isReadOnly}
//                                                 currentValue={watch(`configurations.retriever.${index}.grokkingDepth`)}
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.grokkingDepth
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.grokkingDepth
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                         {(watch(`configurations.retriever.${index}.grokEpochs`) || !isCustomType) && (
//                                             <div className="col-span-12">
//                                                 <Input
//                                                     {...register(`configurations.retriever.${index}.grokEpochs`, {
//                                                         required: { value: true, message: 'Please enter Grok Epochs' },
//                                                     })}
//                                                     label="Grok Epochs"
//                                                     placeholder="Enter Grok Epochs"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]?.grokEpochs
//                                                             ?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]?.grokEpochs
//                                                             ?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                         {(watch(`configurations.retriever.${index}.grokRetrievalTopK`) ||
//                                             !isCustomType) && (
//                                             <div className="col-span-12">
//                                                 <Input
//                                                     {...register(
//                                                         `configurations.retriever.${index}.grokRetrievalTopK`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Grok Retrieval Top-K',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Grok Retrieval Top-K"
//                                                     placeholder="Enter Grok Retrieval Top-K"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.grokRetrievalTopK?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.grokRetrievalTopK?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}{' '}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Summarize long contexts */}
//                     {/* <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div className="col-span-12">
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isSummarizeLongContexts`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <Label htmlFor="enable_reranking">Summarize long contexts</Label>
//                                             <Switch
//                                                 id="enable_reranking"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={
//                                                     (isEdit && isReadOnly) ||
//                                                     !activeInputs.includes('isSummarizeLongContexts')&& isCustomType
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                             {watch(`configurations.retriever.${index}.isSummarizeLongContexts`) && (
//                                 <div className="col-span-12">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.minimumLengthToSummarize`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Minimum length to summarize',
//                                             },
//                                         })}
//                                         label="Minimum length to summarize"
//                                         placeholder="Enter Minimum length to summarize"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                 ?.minimumLengthToSummarize?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.minimumLengthToSummarize
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         </div>
//                     </div> */}
//                     {/* Enable Caching */}
//                     {watch('configurations.ragVariant') !== RagVariant.STANDARD && (
//                         <div className="col-span-12 mt-2">
//                             <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.isEnableCaching`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full justify-between">
//                                                 <Label htmlFor="enable_reranking">Enable Caching</Label>
//                                                 <Switch
//                                                     id="enable_reranking"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={
//                                                         (isEdit && isReadOnly) ||
//                                                         (!activeInputs.includes('isEnableCaching') && isCustomType)
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     />
//                                 </div>
//                                 {watch(`configurations.retriever.${index}.isEnableCaching`) && (
//                                     <>
//                                         <div className="col-span-12 sm:col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.ttl`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter TTL',
//                                                     },
//                                                 })}
//                                                 label="TTL"
//                                                 placeholder="Enter TTL"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.ttl?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.ttl?.message
//                                                 }
//                                             />
//                                         </div>
//                                         <div className="col-span-12 sm:col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.maxRetries`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Max Retries',
//                                                     },
//                                                 })}
//                                                 label="Max Retries"
//                                                 placeholder="Enter Max Retries"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.maxRetries
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.maxRetries
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Enable Explainability */}
//                     {watch('configurations.ragVariant') !== RagVariant.STANDARD && (
//                         <div className="col-span-12">
//                             <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.isEnableExplainability`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full justify-between">
//                                                 <Label htmlFor="enable_reranking">Enable Explainability</Label>
//                                                 <Switch
//                                                     id="enable_reranking"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={
//                                                         (isEdit && isReadOnly) ||
//                                                         (!activeInputs.includes('isEnableExplainability') &&
//                                                             isCustomType)
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     />
//                                 </div>

//                                 {watch(`configurations.retriever.${index}.isEnableExplainability`) && (
//                                     <>
//                                         {(watch(`configurations.retriever.${index}.xaiExplanationDepth`) ||
//                                             isCustomType) && (
//                                             <div className="col-span-12 sm:col-span-6">
//                                                 <Input
//                                                     {...register(
//                                                         `configurations.retriever.${index}.xaiExplanationDepth`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Xai Explanation Depth',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Xai Explanation Depth"
//                                                     placeholder="Enter Xai Explanation Depth"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.xaiExplanationDepth?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.xaiExplanationDepth?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                         {(watch(`configurations.retriever.${index}.xaiExplanationFormat`) ||
//                                             isCustomType) && (
//                                             <div className="col-span-12 sm:col-span-6">
//                                                 <Select
//                                                     {...register(
//                                                         `configurations.retriever.${index}.xaiExplanationFormat`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please select Xai Explanation Format',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Xai Explanation Format"
//                                                     placeholder="Select Xai Explanation Format"
//                                                     options={xaiExplanationOptions}
//                                                     disabled={isEdit && isReadOnly}
//                                                     currentValue={watch(
//                                                         `configurations.retriever.${index}.xaiExplanationFormat`
//                                                     )}
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.xaiExplanationFormat?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.xaiExplanationFormat?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Advanced Iterative Settings */}
//                     {isIterativeRag && (
//                         <div className="col-span-12 mt-2">
//                             <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-[1px] border-gray-300 p-3 rounded-md">
//                                 <div className="col-span-12">
//                                     <Controller
//                                         name={`configurations.retriever.${index}.isAdvancedIterativeSettings`}
//                                         control={control}
//                                         defaultValue={false}
//                                         render={({ field }) => (
//                                             <div className="flex items-center gap-x-2 w-full justify-between">
//                                                 <Label htmlFor="advanced_iterative_settings">
//                                                     Advanced Iterative Settings
//                                                 </Label>
//                                                 <Switch
//                                                     id="advanced_iterative_settings"
//                                                     checked={field.value}
//                                                     onCheckedChange={field.onChange}
//                                                     disabled={isEdit && isReadOnly}
//                                                 />
//                                             </div>
//                                         )}
//                                     />
//                                 </div>

//                                 {watch(`configurations.retriever.${index}.isAdvancedIterativeSettings`) && (
//                                     <>
//                                         {/* Iterative Retrieval Method */}
//                                         <div className="col-span-12">
//                                             <Select
//                                                 {...register(
//                                                     `configurations.retriever.${index}.iterativeRetrievalMethod`,
//                                                     {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please select Iterative Retrieval Method',
//                                                         },
//                                                     }
//                                                 )}
//                                                 label="Iterative Retrieval Method"
//                                                 placeholder="Select Iterative Retrieval Method"
//                                                 options={iterativeRetrievalMethodOptions}
//                                                 disabled={isEdit && isReadOnly}
//                                                 currentValue={watch(
//                                                     `configurations.retriever.${index}.iterativeRetrievalMethod`
//                                                 )}
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.iterativeRetrievalMethod?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.iterativeRetrievalMethod?.message
//                                                 }
//                                             />
//                                         </div>

//                                         {watch(`configurations.retriever.${index}.iterativeRetrievalMethod`) && (
//                                             <>
//                                                 {/* Iterative Rounds */}
//                                                 <div className="col-span-6">
//                                                     <Input
//                                                         {...register(
//                                                             `configurations.retriever.${index}.iterativeRounds`,
//                                                             {
//                                                                 required: {
//                                                                     value: true,
//                                                                     message: 'Please enter Iterative Rounds',
//                                                                 },
//                                                             }
//                                                         )}
//                                                         label="Iterative Rounds"
//                                                         placeholder="3"
//                                                         readOnly={isEdit && isReadOnly}
//                                                         autoComplete="off"
//                                                         isDestructive={
//                                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                                 ?.iterativeRounds?.message
//                                                         }
//                                                         supportiveText={
//                                                             errors?.configurations?.retriever?.[Number(index)]
//                                                                 ?.iterativeRounds?.message
//                                                         }
//                                                     />
//                                                 </div>

//                                                 {/* Iterative Similarity Threshold */}
//                                                 <div className="col-span-6">
//                                                     <Input
//                                                         {...register(
//                                                             `configurations.retriever.${index}.iterativeSimilarityThreshold`,
//                                                             {
//                                                                 required: {
//                                                                     value: true,
//                                                                     message:
//                                                                         'Please enter Iterative Similarity Threshold',
//                                                                 },
//                                                             }
//                                                         )}
//                                                         label="Iterative Similarity Threshold"
//                                                         placeholder="0.8"
//                                                         readOnly={isEdit && isReadOnly}
//                                                         autoComplete="off"
//                                                         isDestructive={
//                                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                                 ?.iterativeSimilarityThreshold?.message
//                                                         }
//                                                         supportiveText={
//                                                             errors?.configurations?.retriever?.[Number(index)]
//                                                                 ?.iterativeSimilarityThreshold?.message
//                                                         }
//                                                     />
//                                                 </div>
//                                             </>
//                                         )}

//                                         {/* Neighborhood Weight - Only for NRR */}
//                                         {watch(`configurations.retriever.${index}.iterativeRetrievalMethod`) ===
//                                             'nrr' && (
//                                             <div className="col-span-12">
//                                                 <Input
//                                                     {...register(
//                                                         `configurations.retriever.${index}.neighborhoodWeight`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Neighborhood Weight',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Neighborhood Weight"
//                                                     placeholder="0.5"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.neighborhoodWeight?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.neighborhoodWeight?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}

//                                         {/* Document Weight - Only for DRR */}
//                                         {watch(`configurations.retriever.${index}.iterativeRetrievalMethod`) ===
//                                             'drr' && (
//                                             <div className="col-span-12">
//                                                 <Input
//                                                     {...register(`configurations.retriever.${index}.documentWeight`, {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter Document Weight',
//                                                         },
//                                                     })}
//                                                     label="Document Weight"
//                                                     placeholder="0.5"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.documentWeight?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.documentWeight?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         )}
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };
