import { FormBody } from '@/app/workspace/[wid]/intelligence-source-configs/llm-configurations/components/llm-configuration-form';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/atoms';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { useLlmConfiguration } from '@/hooks/use-llm-configuration';
import { getSubmitButtonLabel } from '@/lib/utils';
import { Unplug } from 'lucide-react';
import React, { Dispatch, SetStateAction, useEffect } from 'react';

interface ILLMCreationContainerForm {
    openLlmCreationModal: boolean;
    setOpenLlmCreationModal: Dispatch<SetStateAction<boolean>>;
}

export const LLMCreationContainer = ({ openLlmCreationModal, setOpenLlmCreationModal }: ILLMCreationContainerForm) => {
    const isEdit = false;

    const onClose = (open: boolean) => {
        setOpen(open);
        setOpenLlmCreationModal(open);
    };

    const {
        providers,
        errors,
        isOpen,
        isValid,
        secrets,
        isSaving,
        loadingSecrets,
        control,

        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        setOpen,
        refetch,
    } = useLlmConfiguration({ onRefetch: () => onClose(false) });

    useEffect(() => {
        if (openLlmCreationModal) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [openLlmCreationModal]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[unset] w-[580px]">
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            <Unplug />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">New LLM Connection</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px] overflow-y-scroll">
                        <FormBody
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            refetch={refetch}
                            providers={providers}
                            secrets={secrets}
                            errors={errors}
                            isEdit={false}
                            hasTestConnection={true}
                            loadingSecrets={loadingSecrets}
                            control={control}
                            isOpen={isOpen}
                            isValid={isValid}
                            isSaving={isSaving}
                            setOpen={setOpen}
                            handleSubmit={handleSubmit}
                            onHandleSubmit={onHandleSubmit}
                        />
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant={'secondary'}
                            size={'sm'}
                            onClick={() => {
                                setOpen(false);
                                setOpenLlmCreationModal(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size={'sm'}
                                            disabled={!isValid || isSaving || (isEdit && !!watch('isReadOnly'))}
                                            onClick={handleSubmit(onHandleSubmit)}
                                        >
                                            {getSubmitButtonLabel(isSaving, isEdit)}
                                        </Button>
                                    </TooltipTrigger>
                                    {!isValid && (
                                        <TooltipContent side="left" align="center">
                                            All details need to be filled before the form can be saved
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
