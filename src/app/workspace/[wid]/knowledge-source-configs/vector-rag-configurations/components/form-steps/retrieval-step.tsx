// 'use client';

// import { Input, Label, Select } from '@/components';
// import { RagConfigSteps, RetrieverFormProps } from '../retriever-form';
// import { useEffect, useMemo, useState } from 'react';
// import { convertStringListToDropdown } from '@/lib/utils';

// import { Controller } from 'react-hook-form';
// import { Switch } from '@/components/atoms/switch';

// import { Slider } from '@/components/atoms/slider';
// import { validateField } from '@/utils/validation';
// import { useRagSettings } from '@/hooks/use-rag-settings';
// import { MemoryMode, RagVariant } from '@/models/rag-model';

// export const RetrievalStep = (props: RetrieverFormProps) => {
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
//     const allInputSwicth: string[] = [
//         'speculativePreFetch',
//         'isXaiRetrievalSettings',
//         'isRetrievalCachePostSettings',
//         'isConversationContextSettings',
//         'memoryMode',
//     ];
//     const [activeInputs, setActiveInputs] = useState<string[]>([]);

//     const {
//         setcacheEvictionStrategyOptions,
//         lookaheadTriggerOptions,
//         setLookaheadTriggerOptions,
//         speculationMergeStrategyOptions,
//         setSpeculationMergeStrategyOptions,
//     } = useRagSettings();

//     const isReadOnly = useMemo(() => {
//         return !!watch('isReadOnly');
//     }, [watch('isReadOnly')]);

//     const isCustomType = useMemo(() => {
//         return !watch('configurations.customRag');
//     }, [watch('configurations.customRag')]);

//     const shouldShowTopK = useMemo(() => {
//         const ragVariant = watch('configurations.ragVariant') as RagVariant;
//         return isAdvancedMode || ragVariant === RagVariant.STANDARD;
//     }, [isAdvancedMode, watch('configurations.ragVariant')]);

//     const index = useMemo(() => {
//         return retriever?.findIndex(retriever => retriever?.id == currentRetriever);
//     }, [retriever, currentRetriever]);

//     useEffect(() => {
//         if (selectedSettings && isCustomType) {
//             const filteredFields =
//                 selectedSettings.displayFields?.filter(field => field.feature === RagConfigSteps.RETRIEVAL) ?? [];

//             const hasMemoFields = filteredFields?.some(field =>
//                 ['memoSize', 'memoRetrievalTopK', 'memoDecayRate'].includes(field?.name)
//             );

//             const hasSpeculative = filteredFields?.some(field =>
//                 [
//                     'lookaheadNumQueries',
//                     'lookaheadTrigger',
//                     'retrievalTopK',
//                     'speculationMergeStrategy',
//                     'speculationWeight',
//                 ].includes(field?.name)
//             );
//             const isXaiRetrievalSettings = filteredFields?.some(field =>
//                 ['xaiExplanationDepth', 'xaiRetrievalTopK', 'xaiExplanationFormat'].includes(field?.name)
//             );

//             const isRetrievalCachePostSettings = filteredFields?.some(field =>
//                 ['cacheSize', 'cacheEvictionStrategy', 'cacheTTL'].includes(field?.name)
//             );

//             const isConversationContextSettings = filteredFields?.some(field =>
//                 ['cacheEvictionStrategy'].includes(field?.name)
//             );

//             if (hasMemoFields) setValue(`configurations.retriever.${index}.memoryMode`, MemoryMode.MEMO_INDEXING ?? '');
//             if (hasSpeculative) setValue(`configurations.retriever.${index}.speculativePreFetch`, true);
//             if (isXaiRetrievalSettings) setValue(`configurations.retriever.${index}.isXaiRetrievalSettings`, true);
//             if (isConversationContextSettings)
//                 setValue(`configurations.retriever.${index}.isConversationContextSettings`, true);
//             if (isRetrievalCachePostSettings)
//                 setValue(`configurations.retriever.${index}.isRetrievalCachePostSettings`, true);

//             const isCustom = watch('configurations.customRag') ?? false;

//             if (isCustom) {
//                 setActiveInputs(allInputSwicth);
//             } else {
//                 const active: string[] = [];

//                 if (hasMemoFields) active.push('memoryMode');
//                 if (hasSpeculative) active.push('speculativePreFetch');
//                 if (isXaiRetrievalSettings) active.push('isXaiRetrievalSettings');
//                 if (isConversationContextSettings) active.push('isConversationContextSettings');
//                 if (isRetrievalCachePostSettings) active.push('isRetrievalCachePostSettings');

//                 setActiveInputs(active);
//             }
//             // Make sure to set the default value only on load, not during edit.
//             filteredFields?.map(filed => {
//                 switch (filed?.name) {
//                     case 'memoSize':
//                         if (filed?.default)
//                             setValue(`configurations.retriever.${index}.memoSize`, (filed?.default as string) ?? '');
//                         break;
//                     case 'memoRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.memoRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'memoryRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.memoryRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'memoDecayRate':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.memoDecayRate`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'conversationHistorySize':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.conversationHistorySize`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'turnContextRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.turnContextRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'xaiRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.xaiRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'cacheSize':
//                         if (filed?.default)
//                             setValue(`configurations.retriever.${index}.cacheSize`, (filed?.default as string) ?? '');
//                         break;
//                     case 'cacheEvictionStrategy':
//                         setcacheEvictionStrategyOptions(convertStringListToDropdown(filed?.values ?? []) ?? []);
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.cacheEvictionStrategy`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'cacheTTL':
//                         if (filed?.default)
//                             setValue(`configurations.retriever.${index}.cacheTTL`, (filed?.default as string) ?? '');
//                         break;
//                     case 'lookaheadNumQueries':
//                         setValue(
//                             `configurations.retriever.${index}.lookaheadNumQueries`,
//                             (filed?.default as string) ?? ''
//                         );
//                         break;
//                     case 'retrievalTopK':
//                         setValue(`configurations.retriever.${index}.retrievalTopK`, (filed?.default as string) ?? '');
//                         break;
//                     case 'speculationWeight':
//                         setValue(
//                             `configurations.retriever.${index}.speculationWeight`,
//                             (filed?.default as string) ?? ''
//                         );
//                         break;
//                     case 'lookaheadTrigger':
//                         setLookaheadTriggerOptions(convertStringListToDropdown(filed?.values ?? []) ?? []);
//                         setValue(
//                             `configurations.retriever.${index}.lookaheadTrigger`,
//                             (filed?.default as string) ?? ''
//                         );
//                         break;
//                     case 'speculationMergeStrategy':
//                         setSpeculationMergeStrategyOptions(convertStringListToDropdown(filed?.values ?? []) ?? []);
//                         setValue(
//                             `configurations.retriever.${index}.speculationMergeStrategy`,
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
//                 <p className="mb-1">Retrieval</p>
//                 <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
//                     At this stage the system uses your settings to go fetch the most relevant snippets from your chosen
//                     source, readying them for the next steps.
//                 </p>{' '}
//             </div>

//             {/* Top-K field */}
//             {shouldShowTopK && index >= 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
//                     <div className="col-span-12">
//                         <Input
//                             {...register(`configurations.retriever.${index}.topK`, {
//                                 required: {
//                                     value: true,
//                                     message: 'Please enter Top-K',
//                                 },
//                             })}
//                             label="Top-K"
//                             placeholder="Enter Top-K"
//                             readOnly={isEdit && isReadOnly}
//                             autoComplete="off"
//                             isDestructive={!!errors?.configurations?.retriever?.[Number(index)]?.topK?.message}
//                             supportiveText={errors?.configurations?.retriever?.[Number(index)]?.topK?.message}
//                         />
//                     </div>
//                 </div>
//             )}
//             {/* Advanced mode fields */}
//             {isAdvancedMode && index >= 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
//                     <div className="col-span-12">
//                         <Controller
//                             name={`configurations.retriever.${index}.similarityThreshold`}
//                             control={control}
//                             defaultValue={0}
//                             rules={{
//                                 required: validateField('Similarity Threshold', { required: { value: true } }).required,
//                             }}
//                             render={({ field }) => (
//                                 <>
//                                     <Label className="text-sm font-medium text-gray-700 dark:text-gray-100">
//                                         Similarity Threshold: {field.value}
//                                     </Label>
//                                     <Slider
//                                         className="mt-3"
//                                         max={1}
//                                         min={0}
//                                         step={0.1}
//                                         value={[field.value ?? 0]}
//                                         onValueChange={val => field.onChange(val)}
//                                         disabled={isEdit && isReadOnly}
//                                     />
//                                     {errors?.configurations?.retriever?.[Number(index)]?.similarityThreshold
//                                         ?.message && (
//                                         <p className="text-red-500 text-sm mt-1">
//                                             {
//                                                 errors?.configurations?.retriever?.[Number(index)]?.similarityThreshold
//                                                     ?.message
//                                             }
//                                         </p>
//                                     )}
//                                 </>
//                             )}
//                         />
//                     </div>

//                     {/* <div
//                         className={cn('col-span-12', {
//                             'md:col-span-6':
//                                 watch(`configurations.retriever.${index}.memoryMode`) == MemoryMode.MEMO_INDEXING ||
//                                 watch(`configurations.retriever.${index}.memoryMode`) ==
//                                     MemoryMode.CONVERSATIONAL_RETRIEVAL,
//                         })}
//                     >
//                         <Select
//                             {...register(`configurations.retriever.${index}.memoryMode`, {
//                                 required: { value: true, message: 'Please select Memory Mode' },
//                             })}
//                             label="Memory Mode"
//                             placeholder="Select Memory Mode"
//                             options={memoryModeOptions}
//                             disabled={(isEdit && isReadOnly) || !activeInputs.includes('memoryMode')} && isCustomType
//                             currentValue={watch(`configurations.retriever.${index}.memoryMode`)}
//                             isDestructive={!!errors?.configurations?.retriever?.[Number(index)]?.memoryMode?.message}
//                             supportiveText={errors?.configurations?.retriever?.[Number(index)]?.memoryMode?.message}
//                         />
//                     </div>

//                     {watch(`configurations.retriever.${index}.memoryMode`) == MemoryMode.MEMO_INDEXING && (
//                         <>
//                             <div className="col-span-12 md:col-span-6">
//                                 <Select
//                                     {...register(`configurations.retriever.${index}.memoryRetentionDepth`, {
//                                         required: { value: true, message: 'Please select Memory Retention Depth' },
//                                     })}
//                                     label="Memory Retention Depth"
//                                     placeholder="Select Memory Retention Depth"
//                                     options={memoryRetentionOptions}
//                                     disabled={isEdit && isReadOnly}
//                                     currentValue={watch(`configurations.retriever.${index}.memoryRetentionDepth`)}
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.memoryRetentionDepth
//                                             ?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.memoryRetentionDepth
//                                             ?.message
//                                     }
//                                 />
//                             </div>
//                             <div className="col-span-12 md:col-span-6">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.memoSize`, {
//                                         required: { value: true, message: 'Please enter Memo Size' },
//                                     })}
//                                     label="Memo Size"
//                                     placeholder="Enter Memo Size"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.memoSize?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.memoSize?.message
//                                     }
//                                 />
//                             </div>
//                             <div className="col-span-12 md:col-span-6">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.memoDecayRate`, {
//                                         required: { value: true, message: 'Please Memo Decay Rate' },
//                                     })}
//                                     label="Memo Decay Rate"
//                                     placeholder="Enter Memo Decay Rate"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.memoDecayRate?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.memoDecayRate?.message
//                                     }
//                                 />
//                             </div>
//                             <div className="col-span-12">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.memoRetrievalTopK`, {
//                                         required: { value: true, message: 'Please enter Memo Top-k' },
//                                     })}
//                                     label="Memo Top-k"
//                                     placeholder="Enter Memo Top-k"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.memoRetrievalTopK?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.memoRetrievalTopK?.message
//                                     }
//                                 />
//                             </div>
//                         </>
//                     )}
//                     {watch(`configurations.retriever.${index}.memoryMode`) == MemoryMode.CONVERSATIONAL_RETRIEVAL && (
//                         <div className="col-span-12 md:col-span-6">
//                             <Input
//                                 {...register(`configurations.retriever.${index}.sessionSummaryLength`, {
//                                     required: { value: true, message: 'Please enter Session Summary Length' },
//                                 })}
//                                 label="Session Summary Length"
//                                 placeholder="Enter Session Summary Length"
//                                 readOnly={isEdit && isReadOnly}
//                                 autoComplete="off"
//                                 isDestructive={
//                                     !!errors?.configurations?.retriever?.[Number(index)]?.sessionSummaryLength?.message
//                                 }
//                                 supportiveText={
//                                     errors?.configurations?.retriever?.[Number(index)]?.sessionSummaryLength?.message
//                                 }
//                             />
//                         </div>
//                     )} */}

//                     <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div className="col-span-12">
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isXaiRetrievalSettings`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <Label htmlFor="enable_reranking">Explainable Retrieval Settings</Label>
//                                             <Switch
//                                                 id="enable_reranking"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={
//                                                     (isEdit && isReadOnly) ||
//                                                     (!activeInputs.includes('isXaiRetrievalSettings') && isCustomType)
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                             {watch(`configurations.retriever.${index}.isXaiRetrievalSettings`) && <></>}
//                         </div>
//                     </div>

//                     <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div className="col-span-12">
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isRetrievalCachePostSettings`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <Label htmlFor="enable_reranking">Retrieval Cache Settings</Label>
//                                             <Switch
//                                                 id="enable_reranking"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={
//                                                     (isEdit && isReadOnly) ||
//                                                     (!activeInputs.includes('isRetrievalCachePostSettings') &&
//                                                         isCustomType)
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                             {watch(`configurations.retriever.${index}.isRetrievalCachePostSettings`) && (
//                                 <>
//                                     {(watch(`configurations.retriever.${index}.cacheSize`) || !isCustomType) && (
//                                         <div className="col-span-12 sm:col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.cacheSize`, {
//                                                     required: { value: true, message: 'Please enter Cache Size' },
//                                                 })}
//                                                 label="Cache Size"
//                                                 placeholder="Enter Cache Size"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.cacheSize
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.cacheSize
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}

//                                     {(watch(`configurations.retriever.${index}.cacheTTL`) || !isCustomType) && (
//                                         <div className="col-span-12 sm:col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.cacheTTL`, {
//                                                     required: { value: true, message: 'Please enter Cache TTL' },
//                                                 })}
//                                                 label="Cache TTL"
//                                                 placeholder="Enter Cache TTL"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.cacheTTL
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.cacheTTL
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>

//                     <div className="col-span-12 mt-2">
//                         <Controller
//                             name={`configurations.retriever.${index}.includeReferences`}
//                             control={control}
//                             defaultValue={false}
//                             render={({ field }) => (
//                                 <div className="flex items-center gap-x-2 w-full justify-between border-[1px] border-gray-300 p-3 rounded-md">
//                                     <Label htmlFor="enable_pre_fetch">Include references</Label>
//                                     <Switch
//                                         id="enable_pre_fetch"
//                                         checked={field.value}
//                                         onCheckedChange={field.onChange}
//                                         disabled={
//                                             (isEdit && isReadOnly) ||
//                                             (!activeInputs.includes('includeReferences') && isCustomType)
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         />
//                     </div>

//                     {/* <div className="col-span-12 mt-2">
//                         <Controller
//                             name={`configurations.retriever.${index}.isConversationContextSettings`}
//                             control={control}
//                             defaultValue={false}
//                             render={({ field }) => (
//                                 <div className="flex items-center gap-x-2 w-full justify-between border-[1px] border-gray-300 p-3 rounded-md">
//                                     <Label htmlFor="enable_pre_fetch">Conversation Context Settings</Label>
//                                     <Switch
//                                         id="enable_pre_fetch"
//                                         checked={field.value}
//                                         onCheckedChange={field.onChange}
//                                         disabled={
//                                             (isEdit && isReadOnly) ||
//                                             !activeInputs.includes('isConversationContextSettings') && isCustomType
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         />
//                     </div>

//                     {watch(`configurations.retriever.${index}.isConversationContextSettings`) && (
//                         <>
//                             {(watch(`configurations.retriever.${index}.conversationHistorySize`) || isCustomType) && (
//                                 <div className="col-span-12 md:col-span-6">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.conversationHistorySize`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Conversation History Size',
//                                             },
//                                         })}
//                                         label="Conversation History Size"
//                                         placeholder="Enter Conversation History Size"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                 ?.conversationHistorySize?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.conversationHistorySize
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {(watch(`configurations.retriever.${index}.cacheEvictionStrategy`) || isCustomType) && (
//                                 <div className={cn('col-span-12', isCustomType && 'col-span-6')}>
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.cacheEvictionStrategy`, {
//                                             required: { value: true, message: 'Please select Cache Eviction Strategy' },
//                                         })}
//                                         label="Cache Eviction Strategy"
//                                         placeholder="Select Cache Eviction Strategy"
//                                         options={cacheEvictionStrategyOptions}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.cacheEvictionStrategy`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.cacheEvictionStrategy
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.cacheEvictionStrategy
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {(watch(`configurations.retriever.${index}.turnContextRetrievalTopK`) || isCustomType) && (
//                                 <div className={cn('col-span-12 md:col-span-6', isCustomType && 'md:col-span-12')}>
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.turnContextRetrievalTopK`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Turn ContextRetrieval Top-K',
//                                             },
//                                         })}
//                                         label="Turn ContextRetrieval Top-K"
//                                         placeholder="Enter Turn ContextRetrieval Top-K"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                 ?.turnContextRetrievalTopK?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.turnContextRetrievalTopK
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         </>
//                     )} */}

//                     <div className="col-span-12 mt-2">
//                         <Controller
//                             name={`configurations.retriever.${index}.speculativePreFetch`}
//                             control={control}
//                             defaultValue={false}
//                             render={({ field }) => (
//                                 <div className="flex items-center gap-x-2 w-full justify-between border-[1px] border-gray-300 p-3 rounded-md">
//                                     <Label htmlFor="enable_pre_fetch">Speculative pre-fetch</Label>
//                                     <Switch
//                                         id="enable_pre_fetch"
//                                         checked={field.value}
//                                         onCheckedChange={field.onChange}
//                                         disabled={
//                                             (isEdit && isReadOnly) ||
//                                             (!activeInputs.includes('speculativePreFetch') && isCustomType)
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         />
//                     </div>

//                     {watch(`configurations.retriever.${index}.speculativePreFetch`) && (
//                         <>
//                             <div className="col-span-12">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.lookaheadDepth`, {
//                                         required: { value: true, message: 'Please enter Lookahead Depth' },
//                                     })}
//                                     label="Lookahead Depth"
//                                     placeholder="Enter Lookahead Depth"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.lookaheadDepth?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.lookaheadDepth?.message
//                                     }
//                                 />
//                             </div>
//                             {(watch(`configurations.retriever.${index}.lookaheadNumQueries`) || !isCustomType) && (
//                                 <div className="col-span-12 sm:col-span-6">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.lookaheadNumQueries`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Lookahead Num Queries',
//                                             },
//                                         })}
//                                         label="Lookahead Num Queries"
//                                         placeholder="Enter Lookahead Num Queries"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.lookaheadNumQueries
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.lookaheadNumQueries
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}

//                             {(watch(`configurations.retriever.${index}.retrievalTopK`) || !isCustomType) && (
//                                 <div className="col-span-12 sm:col-span-6">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.retrievalTopK`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please enter Retrieval Top-K',
//                                             },
//                                         })}
//                                         label="Retrieval Top-K"
//                                         placeholder="Enter Retrieval Top-K"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.retrievalTopK?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.retrievalTopK?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {(watch(`configurations.retriever.${index}.speculationWeight`) || !isCustomType) && (
//                                 <div className="col-span-12 sm:col-span-12">
//                                     <Input
//                                         {...register(`configurations.retriever.${index}.speculationWeight`, {
//                                             required: {
//                                                 value: true,
//                                                 message: 'Please Enter Speculation Weight',
//                                             },
//                                         })}
//                                         label="Speculation Weight"
//                                         placeholder="Enter Speculation Weight"
//                                         readOnly={isEdit && isReadOnly}
//                                         autoComplete="off"
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.speculationWeight
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.speculationWeight
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}

//                             {(watch(`configurations.retriever.${index}.lookaheadTrigger`) || !isCustomType) && (
//                                 <div className="col-span-12 sm:col-span-6">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.lookaheadTrigger`, {
//                                             required: { value: true, message: 'Please Lookahead Trigger' },
//                                         })}
//                                         label="Lookahead Trigger"
//                                         placeholder="Select Lookahead Trigger"
//                                         options={lookaheadTriggerOptions ?? []}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.lookaheadTrigger`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.lookaheadTrigger
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.lookaheadTrigger
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {(watch(`configurations.retriever.${index}.speculationMergeStrategy`) || !isCustomType) && (
//                                 <div className="col-span-12 sm:col-span-6">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.speculationMergeStrategy`, {
//                                             required: { value: true, message: 'Please SpeculationMerge Strategy' },
//                                         })}
//                                         label="SpeculationMerge Strategy"
//                                         placeholder="Select SpeculationMerge Strategy"
//                                         options={speculationMergeStrategyOptions ?? []}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(
//                                             `configurations.retriever.${index}.speculationMergeStrategy`
//                                         )}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]
//                                                 ?.speculationMergeStrategy?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.speculationMergeStrategy
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };
