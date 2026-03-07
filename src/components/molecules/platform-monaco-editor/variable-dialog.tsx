// VariableDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Unplug } from 'lucide-react';
import { Button } from '@/components';
import { FormBody as VariableFormBody, VariableProps } from '@/app/workspace/[wid]/variables/components/variable-form';

export function VariableDialog({
    isOpen,
    setOpen,
    isValid,
    isSaving,
    errors,
    isEdit,
    register,
    watch,
    setValue,
    handleSubmit,
    onHandleSubmit,
    control,
}: Readonly<VariableProps>) {
    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="max-w-[unset] w-[580px]" onPointerDownOutside={e => e.preventDefault()}>
                <DialogHeader className="px-0">
                    <DialogTitle asChild>
                        <div className="px-4 flex gap-2">
                            <Unplug />
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-100">New Variable</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription asChild>
                    <div className="px-4 flex flex-col gap-y-4 h-[351px]">
                        <VariableFormBody
                            isOpen={isOpen}
                            errors={errors}
                            isEdit={isEdit}
                            isValid={isValid}
                            isSaving={isSaving}
                            setOpen={setOpen}
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            handleSubmit={handleSubmit}
                            onHandleSubmit={onHandleSubmit}
                            control={control}
                        />
                    </div>
                </DialogDescription>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" disabled={!isValid || isSaving} onClick={handleSubmit(onHandleSubmit)}>
                        {isSaving ? 'Saving' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
