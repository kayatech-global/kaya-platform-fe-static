import { Button, Input, SelectableRadioItem } from '@/components';
import { FileX, LoaderCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { IGuardrailsApiTool } from './types';

interface GuardrailsListProps {
    allGuardrailsApiTools: IGuardrailsApiTool[];
    checkedItemId: string[] | undefined;
    handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleItemCheck: (guardrailsApi: IGuardrailsApiTool) => void;
    onEdit: (id: string) => void;
    loading: boolean;
    setOpenForm: () => void;
    searchTerm: string;
}

export const GuardrailsList = ({
    allGuardrailsApiTools,
    checkedItemId,
    handleSearch,
    handleItemCheck,
    onEdit,
    loading,
    setOpenForm,
    searchTerm,
}: GuardrailsListProps) => {
    const [allSearchableGuardrailsApiTools, setAllSearchableGuardrailsApiTools] =
        useState<IGuardrailsApiTool[]>(allGuardrailsApiTools);

    useEffect(() => {
        if (searchTerm) {
            const filteredGuardrailsApis = allGuardrailsApiTools.filter(guardrailsApi =>
                guardrailsApi.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setAllSearchableGuardrailsApiTools(filteredGuardrailsApis);
        } else {
            setAllSearchableGuardrailsApiTools(allGuardrailsApiTools);
        }
    }, [searchTerm, allGuardrailsApiTools]);

    return (
        <div className="flex flex-col gap-y-4 h-[351px]">
            <div className="flex justify-end">
                <Button variant="link" onClick={setOpenForm}>
                    New Guardrails API
                </Button>
            </div>

            {loading ? (
                <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                    <LoaderCircle
                        className="animate-spin"
                        size={25}
                        width={25}
                        height={25}
                        absoluteStrokeWidth={undefined}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                        Please wait! loading the Guardrails API data for you...
                    </p>
                </div>
            ) : (
                <>
                    <Input className="w-full" placeholder="Search Guardrails APIs" onChange={handleSearch} />
                    {allSearchableGuardrailsApiTools?.length > 0 ? (
                        <div className="item-list-container overflow-y-auto flex flex-col gap-y-2">
                            {allSearchableGuardrailsApiTools.map(guardrailsApi => {
                                return (
                                    <SelectableRadioItem
                                        key={guardrailsApi.id}
                                        id={guardrailsApi.id}
                                        title="Guardrails API"
                                        label={guardrailsApi.name}
                                        description={guardrailsApi.description}
                                        isChecked={checkedItemId?.includes(guardrailsApi.id) ?? false}
                                        imagePath="/png/api.png"
                                        handleClick={() => handleItemCheck(guardrailsApi)}
                                        onEdit={onEdit}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                            <FileX className="text-gray-500 dark:text-gray-300" />
                            <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                                {searchTerm ? (
                                    <>No results found</>
                                ) : (
                                    <>
                                        No Guardrails APIs have been
                                        <br /> configured
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
