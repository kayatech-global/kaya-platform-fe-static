import { ApiPreviewHeader, ApiPreviewItem, BulkApiImportWizardViewProps, Spinner } from '@/components';

const ApiPreviewStep = (props: BulkApiImportWizardViewProps) => {
    const {
        foundCount,
        selectedCount,
        testedCount,
        isLoadingPreview,
        fields,
        secrets,
        loadingSecrets,
        watchedBaseUrl,
        watch,
        handleSelectAll,
        handleDeselectAll,
        handleToggleSelect,
        handleTestedChange,
    } = props;

    return (
        <div className="rounded-lg">
            <ApiPreviewHeader
                foundCount={foundCount}
                selectedCount={selectedCount}
                testedCount={testedCount}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
            />
            {isLoadingPreview || watch('previewApis')?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Spinner />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading API Files...</p>
                </div>
            ) : (
                <div className="mt-4 space-y-3">
                    {fields.map(
                        (
                            api,
                            index // use fields from useFieldArray which is equivalent to previewApis
                        ) => (
                            <ApiPreviewItem
                                {...props}
                                index={index}
                                key={api.id}
                                selected={!!api.selected}
                                onSelectChange={checked => handleToggleSelect(api.apiName, !!checked)}
                                onTestedChange={handleTestedChange}
                                apiItem={api}
                                secrets={secrets}
                                loadingSecrets={loadingSecrets}
                                baseUrl={watchedBaseUrl || ''}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default ApiPreviewStep;
