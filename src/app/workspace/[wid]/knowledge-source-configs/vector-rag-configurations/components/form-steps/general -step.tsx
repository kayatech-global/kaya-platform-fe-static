// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client';

// import { RetrieverFormProps } from '../retriever-form';

// export const GeneralStep = (props: RetrieverFormProps) => {
//     // const { register, isEdit, errors, watch, retriever, currentRetriever } = props;

//     // const isReadOnly = useMemo(() => {
//     //     return !!watch('isReadOnly');
//     // }, [watch('isReadOnly')]);

//     // const index = useMemo(() => {
//     //     return retriever?.findIndex(retriever => retriever?.id == currentRetriever);
//     // }, [retriever, currentRetriever]);

//     return (
//         <div className="flex flex-col gap-4">
//             <div className="bg-gray-100 border-[1px] border-gray-200 rounded-md p-3 dark:bg-gray-700 dark:border-gray-600">
//                 <p className="mb-1">General Settings</p>
//                 <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
//                     Choose the type of retriever to use, pick the knowledge base index where your documents live.
//                 </p>
//             </div>

//             {/* {index >= 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full"> */}
//             {/* <div className="col-span-12">
//                         <Input
//                             {...register(`configurations.retriever.${index}.retrieverName`, {
//                                 required: {
//                                     value: true,
//                                     message: 'Please Retriever Name',
//                                 },
//                             })}
//                             label="Retriever Name"
//                             placeholder="Enter Retriever Name"
//                             readOnly={isEdit && isReadOnly}
//                             autoComplete="off"
//                             isDestructive={!!errors?.configurations?.retriever?.[Number(index)]?.retrieverName?.message}
//                             supportiveText={errors?.configurations?.retriever?.[Number(index)]?.retrieverName?.message}
//                         />
//                     </div> */}
//             {/* <div
//                         className={cn('col-span-12', {
//                             'md:col-span-6':
//                                 watch(`configurations.retriever.${index}.memoryMode`) == MemoryMode.MEMO_INDEXING ||
//                                 watch(`configurations.retriever.${index}.memoryMode`) ==
//                                     MemoryMode.CONVERSATIONAL_RETRIEVAL,
//                         })}
//                     >
//                         <Select
//                             {...register(`configurations.retriever.${index}.source`, {
//                                 required: { value: true, message: 'Please select Source' },
//                             })}
//                             label="Source Index"
//                             placeholder="Select Source"
//                             options={sourceTypeOptions}
//                             disabled={isEdit && isReadOnly}
//                             currentValue={watch(`configurations.retriever.${index}.source`)}
//                             isDestructive={!!errors?.configurations?.retriever?.[Number(index)]?.source?.message}
//                             supportiveText={errors?.configurations?.retriever?.[Number(index)]?.source?.message}
//                         />
//                     </div>

//                     {watch(`configurations.retriever.${index}.source`) && (
//                         <div className="col-span-12">
//                             <SourceInfoCard
//                                 data={
//                                     sourcesIndexes?.[watch(`configurations.retriever.${index}.source`) as SourceType] ??
//                                     null
//                                 }
//                             />
//                         </div>
//                     )}

//                     {watch(`configurations.retriever.${index}.source`) &&
//                         watch(`configurations.retriever.${index}.source`) !==
//                             SourceType.PROVIDER_SERVICE_EMBEDDINGS && (
//                             <div
//                                 className={cn('col-span-12', {
//                                     'md:col-span-6':
//                                         watch(`configurations.retriever.${index}.memoryMode`) ==
//                                             MemoryMode.MEMO_INDEXING ||
//                                         watch(`configurations.retriever.${index}.memoryMode`) ==
//                                             MemoryMode.CONVERSATIONAL_RETRIEVAL,
//                                 })}
//                             >
//                                 <Select
//                                     {...register(`configurations.retriever.${index}.retrieverType`, {
//                                         required: { value: true, message: 'Please select Retriever Type' },
//                                     })}
//                                     label="Retriever Type"
//                                     placeholder="Select Retriever Type"
//                                     options={retrieverTypeOptions}
//                                     disabled={isEdit && isReadOnly}
//                                     currentValue={watch(`configurations.retriever.${index}.retrieverType`)}
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.retrieverType?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.retrieverType?.message
//                                     }
//                                 />
//                             </div>
//                         )}
//                     {watch(`configurations.retriever.${index}.retrieverType`) == RetrieverType.BM25 && (
//                         <>
//                             <div className="col-span-6">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.termFrequency`, {
//                                         required: {
//                                             value: true,
//                                             message: 'Please enter K1 (term frequency)',
//                                         },
//                                     })}
//                                     label="K1 (term frequency)"
//                                     placeholder="Enter K1 (term frequency)"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.termFrequency?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.termFrequency?.message
//                                     }
//                                 />
//                             </div>
//                             <div className="col-span-6">
//                                 <Input
//                                     {...register(`configurations.retriever.${index}.lengthNormalization`, {
//                                         required: {
//                                             value: true,
//                                             message: 'Please enter b (length normalization)',
//                                         },
//                                     })}
//                                     label="b (length normalization)"
//                                     placeholder="Enter b (length normalization)"
//                                     readOnly={isEdit && isReadOnly}
//                                     autoComplete="off"
//                                     isDestructive={
//                                         !!errors?.configurations?.retriever?.[Number(index)]?.lengthNormalization
//                                             ?.message
//                                     }
//                                     supportiveText={
//                                         errors?.configurations?.retriever?.[Number(index)]?.lengthNormalization?.message
//                                     }
//                                 />
//                             </div>
//                         </>
//                     )} */}
//             {/* {watch(`configurations.retriever.${index}.retrieverType`) == RetrieverType.TF_IDF && (
//                         <div className="col-span-12 border-[1px] border-gray-300 p-3 rounded-md">
//                             <Controller
//                                 name={`configurations.retriever.${index}.subLinearTf`}
//                                 control={control}
//                                 defaultValue={false}
//                                 render={({ field }) => (
//                                     <div className="flex items-center gap-x-2 w-full justify-between">
//                                         <Label htmlFor="enable_reranking">Enable Sub-linear TF</Label>
//                                         <Switch
//                                             id="enable_reranking"
//                                             checked={field.value}
//                                             onCheckedChange={field.onChange}
//                                             disabled={isEdit && isReadOnly}
//                                         />
//                                     </div>
//                                 )}
//                             />
//                         </div>
//                     )} */}
//             {/* {watch(`configurations.retriever.${index}.source`) == SourceType.PROVIDER_SERVICE_EMBEDDINGS && (
//                         <div className={cn('col-span-12')}>
//                             <Select
//                                 {...register(`configurations.retriever.${index}.distanceMetrics`, {
//                                     required: { value: true, message: 'Please select Distance Metric' },
//                                 })}
//                                 label="Distance Metric"
//                                 placeholder="Select Distance Metric"
//                                 options={distanceMetricsOptions}
//                                 disabled={isEdit && isReadOnly}
//                                 currentValue={watch(`configurations.retriever.${index}.distanceMetrics`)}
//                                 isDestructive={
//                                     !!errors?.configurations?.retriever?.[Number(index)]?.distanceMetrics?.message
//                                 }
//                                 supportiveText={
//                                     errors?.configurations?.retriever?.[Number(index)]?.distanceMetrics?.message
//                                 }
//                             />
//                         </div>
//                     )} */}
//             {/* </div>
//             )}
//         </div> */}
//         </div>
//     );
// };
