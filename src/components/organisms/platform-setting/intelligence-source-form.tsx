import { Button, Select } from '@/components';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { IntelligenceSourceType } from '@/enums';
import { useIntelligenceSource } from '@/hooks/use-intelligence-source';
import { LoaderCircle, Wrench } from 'lucide-react';
import { LLMCreationContainer } from './llm-creation-container';
import { IPlatformSettingData } from '@/models';

interface IntelligenceSourceFormProps {
    isOpen: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onChange?: (value?: IPlatformSettingData) => void;
}

export const IntelligenceSourceForm = (props: IntelligenceSourceFormProps) => {
    const { isOpen, setOpen, onChange } = props;
    const {
        isFetching,
        errors,
        dropdownOptions,
        isValid,
        isSaving,
        openLlmCreationModal,
        setOpenLlmCreationModal,
        register,
        onTypeChange,
        handleSubmit,
        onHandleSubmit,
    } = useIntelligenceSource({ isOpen, onChange });

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setOpen}>
                <DialogContent className="max-w-[unset] w-[580px]">
                    <DialogHeader className="px-0">
                        <DialogTitle asChild>
                            <div className="px-4 flex gap-2">
                                <Wrench />
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">
                                    Workspace Intelligence Source
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription asChild>
                        <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                            {isFetching ? (
                                <div className="w-full flex flex-col items-center justify-center gap-y-1 py-4 h-full">
                                    <LoaderCircle
                                        className="animate-spin"
                                        size={25}
                                        width={25}
                                        height={25}
                                        absoluteStrokeWidth={undefined}
                                    />
                                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                        Please wait! loading the workspace intelligence source data for you...
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-y-4">
                                    <Button
                                        className="self-end"
                                        variant="link"
                                        onClick={() => setOpenLlmCreationModal(true)}
                                    >
                                        New Intelligence Source
                                    </Button>
                                    <div className="grid grid-cols-1 gap-y-4 sm:gap-4">
                                        <Select
                                            {...register('type', {
                                                required: { value: true, message: 'Please select type' },
                                            })}
                                            label="Type"
                                            placeholder="Select your type"
                                            options={[
                                                { name: IntelligenceSourceType.LLM, value: IntelligenceSourceType.LLM },
                                                { name: IntelligenceSourceType.SLM, value: IntelligenceSourceType.SLM },
                                            ]}
                                            isDestructive={!!errors.type?.message}
                                            supportiveText={errors.type?.message}
                                            disabled={true}
                                            onChange={onTypeChange}
                                        />
                                        <Select
                                            {...register('id', {
                                                required: { value: true, message: 'Please select language model' },
                                            })}
                                            label="Language Model"
                                            placeholder="Select your language model"
                                            options={dropdownOptions}
                                            isDestructive={!!errors.id?.message}
                                            supportiveText={errors.id?.message}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="secondary"
                            disabled={isSaving}
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            disabled={!isValid || isSaving}
                            onClick={handleSubmit(onHandleSubmit)}
                        >
                            {isSaving ? 'Saving' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <LLMCreationContainer
                openLlmCreationModal={openLlmCreationModal}
                setOpenLlmCreationModal={setOpenLlmCreationModal}
            />
        </>
    );
};

export default IntelligenceSourceForm;
