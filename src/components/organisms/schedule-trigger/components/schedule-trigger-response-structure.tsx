import { ScheduleTriggerFormProps } from '../schedule-trigger-form';
import { Controller } from 'react-hook-form';
import { validateField } from '@/utils/validation';
import { validateJsonStructure } from '@/lib/utils';
import { SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_PLACEHOLDER } from '@/constants';
import { Spinner } from '@/components/atoms';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@/app/workspace/[wid]/prompt-templates/components/monaco-editor'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center min-h-[480px]">
            <div className="flex flex-col items-center gap-y-2">
                <Spinner />
                <p className="text-md text-gray-700 font-normal dark:text-gray-200">Loading editor...</p>
            </div>
        </div>
    ),
});

export const ScheduleTriggerResponseStructure = ({
    control,
    intellisenseOptions,
    errors,
    isEdit,
    isReadOnly,
    editorContent,
    trigger,
    handleEditorChange,
    refetchIntellisense,
}: ScheduleTriggerFormProps) => {
    return (
        <>
            <Controller
                name={'configurations.data.externalDataSource.responseStructure'}
                control={control}
                defaultValue={editorContent}
                rules={{
                    required: validateField('Response structure', {
                        required: { value: true },
                    }).required,
                    validate: value => validateJsonStructure(value as string, true),
                }}
                render={({ field }) => (
                    <MonacoEditor
                        {...field}
                        value={editorContent}
                        hasEnhance={false}
                        autoWidgetHeight={true}
                        onChange={handleEditorChange}
                        intellisenseData={intellisenseOptions ?? []}
                        isDestructive={!!errors?.configurations?.data?.externalDataSource?.responseStructure?.message}
                        placeholder={SCHEDULE_DATA_SOURCE_RESPONSE_STRUCTURE_PLACEHOLDER}
                        disabled={isEdit && isReadOnly}
                        onRefetchVariables={async () => await refetchIntellisense?.()}
                        height="h-[260px]"
                        onBlur={async () => await trigger('configurations.data.externalDataSource.responseStructure')}
                    />
                )}
            />
            {!!errors?.configurations?.data?.externalDataSource?.responseStructure?.message && (
                <span className="text-xs font-normal text-red-500 dark:text-red-500">
                    {errors?.configurations?.data?.externalDataSource?.responseStructure?.message}
                </span>
            )}
        </>
    );
};
