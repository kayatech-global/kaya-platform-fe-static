// 'use client';

// import { Input, Label, Select } from '@/components';
// import { RagConfigSteps, RetrieverFormProps } from '../retriever-form';

// import { useEffect, useMemo, useState } from 'react';
// import { Controller } from 'react-hook-form';
// import { Switch } from '@/components/atoms/switch';
// import { PromptSelector } from '@/app/editor/[wid]/[workflow_id]/components/prompt-selector';
// import { AgentType, IntelligenceSourceModel, Prompt } from '@/components/organisms';
// import { PromptResponse } from '@/app/workspace/[wid]/agents/components/agent-form';
// import { useQuery } from 'react-query';
// import { $fetch } from '@/utils';
// import { useParams } from 'next/navigation';
// import { useAuth } from '@/context';
// import { SwitchLabel } from './switch-label';
// import { IModel, LanguageSelector } from '@/app/editor/[wid]/[workflow_id]/components/language-selector';
// import { IAllModel } from '@/models';
// import { filterTypeOptions, queryExpansionOptions } from '@/constants/rag-constants';
// import { FilterKeyValueInput } from '@/components/atoms/filter-key-value-input';

// const getAllPrompts = async (workspaceId: number) => {
//     const response = await $fetch<PromptResponse[]>(`/workspaces/${workspaceId}/prompt-template`, {
//         method: 'GET',
//         headers: {
//             'x-workspace-id': workspaceId.toString(),
//         },
//     });

//     return response.data;
// };

// const getAllModels = async (workspaceId: number) => {
//     const response = await $fetch<IAllModel[]>(`/workspaces/${workspaceId}/llm`, {
//         method: 'GET',
//         headers: {
//             'x-workspace-id': workspaceId.toString(),
//         },
//     });

//     return response.data;
// };

// export const PreRetrievalStep = (props: RetrieverFormProps) => {
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
//         metaDataFilters,
//         appendFilter,
//         removeFilter,
//     } = props;
//     const [agent] = useState<AgentType>();
//     const [prompt, setPrompt] = useState<Prompt>();
//     const params = useParams();
//     const { token } = useAuth();
//     const allInputSwicth: string[] = ['isMetaDataFiltering', 'isQueryExpansion', 'isAdvancedQueryTuning'];
//     const [languageModel, setLanguageModel] = useState<IntelligenceSourceModel>();
//     const [isSlm, setSlm] = useState<boolean>(false);
//     const [activeInputs, setActiveInputs] = useState<string[]>([]);

//     const isReadOnly = useMemo(() => {
//         return !!watch('isReadOnly');
//     }, [watch('isReadOnly')]);

//     const isCustomType = useMemo(() => {
//         return !watch('configurations.customRag');
//     }, [watch('configurations.customRag')]);

//     const index = useMemo(() => {
//         return retriever?.findIndex(retriever => retriever?.id == currentRetriever);
//     }, [retriever, currentRetriever]);

//     const {
//         data: allPrompts,
//         isFetching: fetchingPrompts,
//         isLoading: promptsLoading,
//         // refetch: refetchPrompts,
//     } = useQuery('prompts', () => getAllPrompts(parseInt(params.wid as string)), {
//         enabled: !!token,
//         refetchOnWindowFocus: false,
//         onError: error => {
//             console.error('Failed to fetch prompts:', error);
//         },
//     });

//     const {
//         data: allModels,
//         // isFetching: fetchingModels,
//         isLoading: llmModelsLoading,
//         refetch: refetchLlms,
//     } = useQuery('llmModels', () => getAllModels(parseInt(params.wid as string)), {
//         enabled: !!token,
//         refetchOnWindowFocus: false,
//         onError: error => {
//             console.error('Failed to fetch LLM:', error);
//         },
//     });

//     useEffect(() => {
//         if (selectedSettings && isCustomType) {
//             const filteredFields =
//                 selectedSettings.displayFields?.filter(field => field.feature === RagConfigSteps.PRE_RETRIEVAL) ?? [];
//             const hasdvancedQueryTuning = filteredFields?.some(field =>
//                 [
//                     'initialRetrievalTopK',
//                     'feedbackDocsCount',
//                     'feedbackTermsCount',
//                     'rocchioAlpha',
//                     'rocchioBeta',
//                 ].includes(field?.name)
//             );

//             // Make sure to set the default value only on load, not during edit.
//             if (hasdvancedQueryTuning) setValue(`configurations.retriever.${index}.isAdvancedQueryTuning`, true);
//             const isCustom = watch('configurations.customRag') ?? false;

//             if (isCustom) {
//                 setActiveInputs(allInputSwicth);
//             } else {
//                 const active: string[] = [];

//                 if (hasdvancedQueryTuning) active.push('isAdvancedQueryTuning');

//                 setActiveInputs(active);
//             }

//             filteredFields?.map(filed => {
//                 switch (filed?.name) {
//                     case 'initialRetrievalTopK':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.initialRetrievalTopK`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'feedbackDocsCount':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.feedbackDocsCount`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'feedbackTermsCount':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.feedbackTermsCount`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'rocchioAlpha':
//                         if (filed?.default)
//                             setValue(
//                                 `configurations.retriever.${index}.rocchioAlpha`,
//                                 (filed?.default as string) ?? ''
//                             );
//                         break;
//                     case 'rocchioBeta':
//                         if (filed?.default)
//                             setValue(`configurations.retriever.${index}.rocchioBeta`, (filed?.default as string) ?? '');
//                         break;

//                     default:
//                         break;
//                 }
//             });
//         }
//     }, [selectedSettings]);

//     const manageLanguageModel = (response: IntelligenceSourceModel | undefined) => {
//         if (response && !isSlm) {
//             setValue('configurations.generator.languageModal', response.modelId);
//         }
//     };

//     return (
//         <div className="flex flex-col gap-4">
//             <div className="bg-gray-100 border-[1px] border-gray-200 rounded-md p-3 dark:bg-gray-700 dark:border-gray-600">
//                 <p className="mb-1">Pre Retrieval</p>
//                 <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
//                     Here you set any filters or helpful tweaks for your question before it goes out, so you only search
//                     the parts of your collection you care about and can even refine your wording automatically.
//                 </p>
//             </div>

//             {isAdvancedMode && index >= 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
//                     {/* Enable Reranking */}
//                     <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div className="col-span-12">
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isMetaDataFiltering`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <SwitchLabel htmlFor="meta_data_filter" label="Meta Data filtering" />
//                                             <Switch
//                                                 id="meta_data_filter"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={
//                                                     (isEdit && isReadOnly) ||
//                                                     (!activeInputs.includes('isMetaDataFiltering') && isCustomType)
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                             {watch(`configurations.retriever.${index}.isMetaDataFiltering`) && (
//                                 <>
//                                     <div className="col-span-12">
//                                         <Select
//                                             {...register(`configurations.retriever.${index}.filterThenVector`, {
//                                                 required: { value: true, message: 'Please Select Filter Type' },
//                                             })}
//                                             placeholder="Select Filter Type"
//                                             options={filterTypeOptions}
//                                             disabled={isEdit && isReadOnly}
//                                             currentValue={watch(`configurations.retriever.${index}.filterThenVector`)}
//                                             isDestructive={
//                                                 !!errors?.configurations?.retriever?.[Number(index)]?.filterThenVector
//                                                     ?.message
//                                             }
//                                             supportiveText={
//                                                 errors?.configurations?.retriever?.[Number(index)]?.filterThenVector
//                                                     ?.message
//                                             }
//                                         />
//                                     </div>
//                                     <div className="col-span-12">
//                                         <FilterKeyValueInput
//                                             label="Filters"
//                                             register={register}
//                                             fields={metaDataFilters}
//                                             namePrefix="metaDataFilters"
//                                             append={appendFilter}
//                                             remove={removeFilter}
//                                             control={control}
//                                             list={watch('configurations.metaDataFilters') ?? []}
//                                             disabledInputs={
//                                                 (isEdit && isReadOnly) ||
//                                                 !watch(`configurations.retriever.${index}.filterThenVector`)
//                                             }
//                                         />
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     </div>

//                     {/* Enable Explainability */}
//                     <div className="col-span-12 flex flex-col gap-y-2">
//                         <p className="text-sm font-medium text-gray-700 dark:text-gray-100">Query Enhancement</p>
//                         <div className="w-full flex flex-col gap-4 border-[1px] border-gray-300 p-3 rounded-md ">
//                             <Controller
//                                 name={`configurations.retriever.${index}.isQueryExpansion`}
//                                 control={control}
//                                 defaultValue={false}
//                                 render={({ field }) => (
//                                     <div className="flex items-center gap-x-2 w-full justify-between">
//                                         <Label htmlFor="enable_reranking">Query Expansion</Label>
//                                         <Switch
//                                             id="enable_reranking"
//                                             checked={field.value}
//                                             onCheckedChange={field.onChange}
//                                             disabled={
//                                                 (isEdit && isReadOnly) ||
//                                                 (!activeInputs.includes('isQueryExpansion') && isCustomType)
//                                             }
//                                         />
//                                     </div>
//                                 )}
//                             />
//                             {watch(`configurations.retriever.${index}.isQueryExpansion`) && (
//                                 <div className="col-span-12">
//                                     <Select
//                                         {...register(`configurations.retriever.${index}.queryExpansionType`, {
//                                             required: { value: true, message: 'Please select query expansion type' },
//                                         })}
//                                         label="Query expansion type"
//                                         placeholder="Select query expansion type"
//                                         options={queryExpansionOptions}
//                                         disabled={isEdit && isReadOnly}
//                                         currentValue={watch(`configurations.retriever.${index}.queryExpansionType`)}
//                                         isDestructive={
//                                             !!errors?.configurations?.retriever?.[Number(index)]?.filterThenVector
//                                                 ?.message
//                                         }
//                                         supportiveText={
//                                             errors?.configurations?.retriever?.[Number(index)]?.filterThenVector
//                                                 ?.message
//                                         }
//                                     />
//                                 </div>
//                             )}
//                             {watch(`configurations.retriever.${index}.isQueryExpansion`) && (
//                                 <div className="p-2 rounded-md">
//                                     {watch(`configurations.retriever.${index}.queryExpansionType`) ===
//                                         queryExpansionOptions[0].value && (
//                                         <div className="gap-4 grid grid-cols-2">
//                                             <div className="col-span-1">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(
//                                                         `configurations.retriever.${index}.initialRetrievalTopK`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Initial Retrieval Top-K',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Initial Retrieval Top-K"
//                                                     placeholder="Enter Initial Retrieval Top-K"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.initialRetrievalTopK?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.initialRetrievalTopK?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-1">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(
//                                                         `configurations.retriever.${index}.feedbackTermsCount`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Feedback Terms Count',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Feedback Terms Count"
//                                                     placeholder="Enter Feedback Terms Count"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.feedbackTermsCount?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.feedbackTermsCount?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-1">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(`configurations.retriever.${index}.rocchioAlpha`, {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter Rocchio Alpha',
//                                                         },
//                                                     })}
//                                                     label="Rocchio Alpha"
//                                                     placeholder="Enter Rocchio Alpha"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.rocchioAlpha?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]?.rocchioAlpha
//                                                             ?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-1">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(`configurations.retriever.${index}.rocchioBeta`, {
//                                                         required: {
//                                                             value: true,
//                                                             message: 'Please enter Rocchio Beta',
//                                                         },
//                                                     })}
//                                                     label="Rocchio Beta"
//                                                     placeholder="Enter Rocchio Beta"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.rocchioBeta?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]?.rocchioBeta
//                                                             ?.message
//                                                     }
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}
//                                     {watch(`configurations.retriever.${index}.queryExpansionType`) ===
//                                         queryExpansionOptions[1].value && (
//                                         <div className="gap-4 grid grid-cols-12">
//                                             <div className="col-span-6">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(
//                                                         `configurations.retriever.${index}.hydeGenerationTemperature`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Hyde Generation Temperature',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Hyde Generation Temperature"
//                                                     placeholder="Enter hyde generation temperature"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeGenerationTemperature?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeGenerationTemperature?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-6">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(
//                                                         `configurations.retriever.${index}.hydeGenerationMaxTokens`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter hyde Generation Max Tokens',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Hyde Generation Max Tokens"
//                                                     placeholder="Enter hyde generation max tokens"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeGenerationMaxTokens?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeGenerationMaxTokens?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-12">
//                                                 <Input
//                                                     type="number"
//                                                     {...register(
//                                                         `configurations.retriever.${index}.hydeNumPseudoDocs`,
//                                                         {
//                                                             required: {
//                                                                 value: true,
//                                                                 message: 'Please enter Hyde Num Pseudo Docs',
//                                                             },
//                                                         }
//                                                     )}
//                                                     label="Hyde Num Pseudo Docs"
//                                                     placeholder="Enter Hyde Num Pseudo Docs"
//                                                     readOnly={isEdit && isReadOnly}
//                                                     autoComplete="off"
//                                                     isDestructive={
//                                                         !!errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeNumPseudoDocs?.message
//                                                     }
//                                                     supportiveText={
//                                                         errors?.configurations?.retriever?.[Number(index)]
//                                                             ?.hydeNumPseudoDocs?.message
//                                                     }
//                                                 />
//                                             </div>
//                                             <div className="col-span-12  border-[1px] border-gray-300 dark:bg-gray-700 dark:border-gray-600 bg-gray-50 rounded-lg p-2 sm:p-4">
//                                                 <LanguageSelector
//                                                     isSlm={false}
//                                                     agent={agent}
//                                                     languageModel={languageModel}
//                                                     llmModelsLoading={llmModelsLoading}
//                                                     slmModelsLoading={false}
//                                                     setLanguageModel={setLanguageModel}
//                                                     allModels={(allModels as IModel[]) ?? []}
//                                                     allSTSModels={[]}
//                                                     allSLMModels={[]}
//                                                     isReadonly={isEdit && !!watch('isReadOnly')}
//                                                     onRefetch={() => {
//                                                         refetchLlms();
//                                                     }}
//                                                     onLanguageModelChange={manageLanguageModel}
//                                                     onIntelligenceSourceChange={value => setSlm(value)}
//                                                 />
//                                             </div>
//                                             <div className="col-span-12 border border-gray-200 bg-gray-100 p-2 rounded-md">
//                                                 <PromptSelector
//                                                     agent={agent}
//                                                     prompt={prompt}
//                                                     isReadonly={isEdit && !!watch('isReadOnly')}
//                                                     promptsLoading={fetchingPrompts || promptsLoading}
//                                                     setPrompt={setPrompt}
//                                                     allPrompts={allPrompts as PromptResponse[]}
//                                                     onRefetch={() => {}}
//                                                     onPromptChange={() => {}}
//                                                 />
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {/* <Controller
//                                 name={`configurations.retriever.${index}.hyde`}
//                                 control={control}
//                                 defaultValue={false}
//                                 render={({ field }) => (
//                                     <div className="flex items-center gap-x-2 w-full justify-between">
//                                         <Label htmlFor="enable_reranking">HyDE</Label>
//                                         <Switch
//                                             id="enable_reranking"
//                                             checked={field.value}
//                                             onCheckedChange={field.onChange}
//                                             disabled={isEdit && isReadOnly}
//                                         />
//                                     </div>
//                                 )}
//                             /> */}
//                         </div>
//                     </div>

//                     <div className="col-span-12 mt-2">
//                         <div className=" grid grid-cols-1 sm:grid-cols-12 gap-3  border-[1px] border-gray-300 p-3 rounded-md">
//                             <div className="col-span-12">
//                                 <Controller
//                                     name={`configurations.retriever.${index}.isAdvancedQueryTuning`}
//                                     control={control}
//                                     defaultValue={false}
//                                     render={({ field }) => (
//                                         <div className="flex items-center gap-x-2 w-full justify-between">
//                                             <Label htmlFor="enable_reranking">Advanced Query Tuning</Label>
//                                             <Switch
//                                                 id="enable_reranking"
//                                                 checked={field.value}
//                                                 onCheckedChange={field.onChange}
//                                                 disabled={
//                                                     (isEdit && isReadOnly) ||
//                                                     (!activeInputs.includes('isAdvancedQueryTuning') && isCustomType)
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 />
//                             </div>
//                             {watch(`configurations.retriever.${index}.isAdvancedQueryTuning`) && (
//                                 <>
//                                     {(watch(`configurations.retriever.${index}.initialRetrievalTopK`) ||
//                                         isCustomType) && (
//                                         <div className="col-span-12">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.initialRetrievalTopK`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Initial Retrieval Top-K',
//                                                     },
//                                                 })}
//                                                 label="Initial Retrieval Top-K"
//                                                 placeholder="Enter Initial Retrieval Top-K"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.initialRetrievalTopK?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.initialRetrievalTopK?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                     {(watch(`configurations.retriever.${index}.feedbackDocsCount`) ||
//                                         !isCustomType) && (
//                                         <div className="col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.feedbackDocsCount`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Feedback Docs Count',
//                                                     },
//                                                 })}
//                                                 label="Feedback Docs Count"
//                                                 placeholder="Enter Feedback Docs Count"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.feedbackDocsCount?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.feedbackDocsCount?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                     {(watch(`configurations.retriever.${index}.feedbackTermsCount`) ||
//                                         isCustomType) && (
//                                         <div className="col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.feedbackTermsCount`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Feedback Terms Count',
//                                                     },
//                                                 })}
//                                                 label="Feedback Terms Count"
//                                                 placeholder="Enter Feedback Terms Count"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.feedbackTermsCount?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]
//                                                         ?.feedbackTermsCount?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                     {(watch(`configurations.retriever.${index}.rocchioAlpha`) || !isCustomType) && (
//                                         <div className="col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.rocchioAlpha`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Rocchio Alpha',
//                                                     },
//                                                 })}
//                                                 label="Rocchio Alpha"
//                                                 placeholder="Enter Rocchio Alpha"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.rocchioAlpha
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.rocchioAlpha
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                     {(watch(`configurations.retriever.${index}.rocchioBeta`) || !isCustomType) && (
//                                         <div className="col-span-6">
//                                             <Input
//                                                 {...register(`configurations.retriever.${index}.rocchioBeta`, {
//                                                     required: {
//                                                         value: true,
//                                                         message: 'Please enter Rocchio Beta',
//                                                     },
//                                                 })}
//                                                 label="Rocchio Beta"
//                                                 placeholder="Enter Rocchio Beta"
//                                                 readOnly={isEdit && isReadOnly}
//                                                 autoComplete="off"
//                                                 isDestructive={
//                                                     !!errors?.configurations?.retriever?.[Number(index)]?.rocchioBeta
//                                                         ?.message
//                                                 }
//                                                 supportiveText={
//                                                     errors?.configurations?.retriever?.[Number(index)]?.rocchioBeta
//                                                         ?.message
//                                                 }
//                                             />
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
