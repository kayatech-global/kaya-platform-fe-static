import { useEffect, useMemo, useRef, useState } from 'react';
import { VectorRagConfigurationFormProps } from './vector-rag-configuration-form';
import { Button, FormFieldGroup, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components';
import { GeneralFormFields } from './general-form-fields';
import { PreRetrievalFormFields } from './pre-retrieval-form-fields';
import { RetrievalFormFields } from './retrieval-form-fields';
import { PostRetrievalFormFields } from './post-retrieval-form-fields';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { Database, Info, Plus, Trash2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { RetrievalPicker, RetrievalPickerRef } from '../../graph-rag-configurations/components/forms/retrieval-picker';

interface RetrievalFormProps extends VectorRagConfigurationFormProps {
    index: number;
    hasAccordionItem?: boolean;
}

const RetrievalForm = (props: RetrievalFormProps) => {
    const { watch } = props;
    const isReadOnly = useMemo(() => {
        return !!watch('isReadOnly');
    }, [watch('isReadOnly')]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* General Form Fields */}
            <FormFieldGroup
                title="General"
                description="Choose the type of retriever to use, pick the knowledge base index where your documents live."
                showSeparator={false}
            >
                <GeneralFormFields props={props} isReadOnly={isReadOnly} />
            </FormFieldGroup>
            {/* Pre retrieval For Fields */}
            <FormFieldGroup
                title="Pre Retrieval"
                description="Here you set any filters or helpful tweaks for your question before it goes out, so you only search the parts of your collection you care about and can even refine your wording automatically."
                showSeparator={false}
            >
                <PreRetrievalFormFields props={props} isReadOnly={isReadOnly} />
            </FormFieldGroup>
            {/* Retrieval For Fields */}
            <FormFieldGroup
                title="Retrieval"
                description="At this stage the system uses your settings to go fetch the most relevant snippets from your chosen source, readying them for the next steps."
                showSeparator={false}
            >
                <RetrievalFormFields props={props} isReadOnly={isReadOnly} />
            </FormFieldGroup>
            {/* Post Retrieval */}
            <FormFieldGroup
                title="Post Retrieval"
                description="After the snippets arrive, this view lets you tidy them up - ordering, trimming, explaining or caching results - so that the information is cleaner and easier to work with."
                showSeparator={false}
            >
                <PostRetrievalFormFields props={props} isReadOnly={isReadOnly} />
            </FormFieldGroup>
        </div>
    );
};

const AccordionLayout = (props: RetrievalFormProps) => {
    const { control, index, hasAccordionItem, trigger, removeRetrieval } = props;
    const [isValid, setValid] = useState<boolean>(false);

    const watchedRow = useWatch({
        control,
        name: `configurations.retrievals.${index}`,
    });

    useEffect(() => {
        (async () => {
            if (hasAccordionItem) {
                const validate = await trigger(`configurations.retrievals.${index}`, { shouldFocus: false });
                setValid(validate);
            }
        })();
    }, [watchedRow, index, hasAccordionItem, trigger]);

    if (hasAccordionItem) {
        return (
            <AccordionItem
                value={`item-${index}`}
                className="border border-border rounded-md bg-muted/40 mb-4 overflow-hidden"
            >
                <AccordionTrigger className="px-2 py-2 no-underline hover:no-underline">
                    <div className="flex justify-between items-center w-[95%]">
                        <div className="flex items-center gap-x-2">
                            <div className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500">
                                <Database size={20} className="text-blue-500 dark:text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                Retrieval #{index + 1}
                            </p>
                            {!isValid && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info size={16} className="text-red-500 dark:text-red-400" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" align="center" className="w-[300px]">
                                            {`Looks like some fields in the retrieval settings are missing. Please fill them in before saving.`}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        <Trash2
                            size={16}
                            className="font-normal text-red-500 dark:text-red-600"
                            onClick={() => removeRetrieval(index)}
                        />
                    </div>
                </AccordionTrigger>
                <AccordionContent className="py-3 px-3" forceMount>
                    <RetrievalForm {...props} />
                </AccordionContent>
            </AccordionItem>
        );
    }

    return <RetrievalForm {...props} />;
};

export const RetrievalTab = (props: VectorRagConfigurationFormProps) => {
    const { retrievalFields, isValid, isEdit, control, watch, appendRetrieval, removeRetrieval, trigger } = props;
    const retrievalPickerRef = useRef<RetrievalPickerRef>(null);
    const [openItem, setOpenItem] = useState<string>('');
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [draftIndex, setDraftIndex] = useState<number | null>(null);
    const [limit] = useState<number>(10);

    const fields = useMemo(() => {
        return retrievalFields?.filter((_, index) => index !== draftIndex);
    }, [retrievalFields, draftIndex]);

    const retrievalRules = useMemo(() => {
        return (
            !openModal && {
                validate: (value: unknown[]) =>
                    (value && value.filter((_, index) => index !== draftIndex).length > 0) ||
                    'At least one retrieval is required',
            }
        );
    }, [openModal, draftIndex]);

    useEffect(() => {
        if (!openModal) {
            if (retrievalPickerRef.current) {
                retrievalPickerRef.current?.triggerBlur();
            }
        }
    }, [openModal, fields]);

    const addRetrieval = () => {
        setOpenItem('');
        const newIndex = retrievalFields.length;
        appendRetrieval();
        setDraftIndex(newIndex);
        setOpenModal(true);
    };

    const onModalClose = (open: boolean) => {
        if (!open && draftIndex !== null) {
            removeRetrieval(draftIndex);
            setDraftIndex(null);
        }
        setOpenModal(open);
    };

    const onSubmit = () => {
        setOpenModal(false);
        setDraftIndex(null);
        if (retrievalPickerRef.current) {
            retrievalPickerRef.current?.triggerBlur();
        }
    };

    return (
        <>
            {watch('configurations.ragVariant') && (
                <>
                    {fields?.length > 0 && (
                        <div className="col-span-1 sm:col-span-2 flex justify-end">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'icon'}
                                            variant="secondary"
                                            disabled={
                                                !isValid || (isEdit && !!watch('isReadOnly')) || fields.length >= limit
                                            }
                                            onClick={addRetrieval}
                                        >
                                            <Plus />
                                        </Button>
                                    </TooltipTrigger>
                                    {(fields.length >= limit || !isValid) && (
                                        <TooltipContent side="left" align="center">
                                            {fields.length >= limit
                                                ? `You've reached the limit. Only ${limit} records can be added.`
                                                : 'Each item must be valid before a new one can be added.'}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                    <div className="col-span-1 sm:col-span-2">
                        {fields?.length > 0 ? (
                            <Accordion
                                type="single"
                                value={openItem}
                                onValueChange={value => setOpenItem(value)}
                                collapsible
                            >
                                {fields?.map((item, index) => (
                                    <AccordionLayout
                                        key={item.id ?? index}
                                        {...props}
                                        index={index}
                                        hasAccordionItem={true}
                                    />
                                ))}
                            </Accordion>
                        ) : (
                            <RetrievalPicker
                                ref={retrievalPickerRef}
                                name="configurations.retrievals"
                                description="Create a new retrieval configuration to use with this Vector RAG configuration."
                                control={control}
                                rules={retrievalRules}
                                trigger={trigger}
                                disabled={isEdit && !!watch('isReadOnly')}
                                onRetrieval={addRetrieval}
                            />
                        )}
                    </div>
                </>
            )}
            <Dialog open={openModal} onOpenChange={onModalClose}>
                <DialogContent className="max-w-[unset] w-[580px] ">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    Configure Retrieval
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="p-3 flex flex-col gap-y-4 h-[351px] overflow-y-auto">
                            {typeof draftIndex === 'number' && draftIndex >= 0 ? (
                                <AccordionLayout {...props} index={draftIndex} />
                            ) : (
                                <p className="text-center text-xs font-normal">Loading...</p>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => onModalClose(false)}>
                            Cancel
                        </Button>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        disabled={!isValid || (isEdit && !!watch('isReadOnly'))}
                                        onClick={onSubmit}
                                    >
                                        Create
                                    </Button>
                                </TooltipTrigger>
                                {!isValid && (
                                    <TooltipContent side="left" align="center">
                                        All details need to be filled before the form can be saved
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
