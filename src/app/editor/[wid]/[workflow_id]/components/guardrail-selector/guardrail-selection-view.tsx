import React from 'react';
import { Input, SelectableRadioItem, TruncateCell } from '@/components';
import { Badge } from '@/components/atoms/badge';
import { FileX, LoaderCircle } from 'lucide-react';
import { GuardrailBindingLevelType } from '@/enums';
import { IGuardrailSetup, IGuardrailGroup } from '@/models/guardrail.model';

interface GuardrailSelectionViewProps {
    loading: boolean;
    searchTerm: string;
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    allSearchableGuardrails: IGuardrailSetup[] | undefined;
    selectedItems: string[] | undefined;
    disabledOptions: string[];
    isReadonly?: boolean;
    onCheck: (item: IGuardrailSetup) => void;
    onEdit: (id: string) => void;
    selectedGuardrails: IGuardrailGroup[];
    level: GuardrailBindingLevelType;
}

export const GuardrailSelectionView: React.FC<GuardrailSelectionViewProps> = ({
    loading,
    searchTerm,
    onSearch,
    allSearchableGuardrails,
    selectedItems,
    disabledOptions,
    isReadonly,
    onCheck,
    onEdit,
    selectedGuardrails,
    level,
}) => {
    if (loading) {
        return (
            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                <LoaderCircle
                    className="animate-spin"
                    size={25}
                    width={25}
                    height={25}
                    absoluteStrokeWidth={undefined}
                />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    Please wait! loading the guardrails data for you...
                </p>
            </div>
        );
    }

    if (!allSearchableGuardrails || allSearchableGuardrails.length === 0) {
        return (
            <div className="w-full flex flex-col items-center gap-y-1 justify-center py-4 h-full">
                <FileX className="text-gray-500 dark:text-gray-300" />
                <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                    {searchTerm ? (
                        <>No results found</>
                    ) : (
                        <>
                            No Guardrails have been
                            <br /> configured
                        </>
                    )}
                </p>
            </div>
        );
    }

    const sortedGuardrails = allSearchableGuardrails.toSorted((a, b) => {
        const aChecked = selectedItems?.includes(a.id as string);
        const bChecked = selectedItems?.includes(b.id as string);
        if (aChecked && !bChecked) return -1;
        if (!aChecked && bChecked) return 1;
        return 0;
    });

    const getBadgeVariant = (level: GuardrailBindingLevelType) => {
        if (level === GuardrailBindingLevelType.WORKSPACE) return 'success';
        if (level === GuardrailBindingLevelType.WORKFLOW) return 'info';
        return 'warning';
    };

    return (
        <>
            <Input
                className="w-full"
                placeholder="Search guardrails"
                onChange={onSearch} // Assuming Input's onChange signature is compatible or requires wrapping
                // If Input component expects specific signature, we handled type in props
            />
            <div className="item-list-container overflow-y-auto flex flex-col gap-y-2 mt-2">
                {sortedGuardrails.map(x => (
                    <SelectableRadioItem
                        key={x.id as string}
                        id={x.id as string}
                        title="Guardrail"
                        label={x.name}
                        description={x.description}
                        isChecked={!!selectedItems?.includes(x.id as string)}
                        disabled={disabledOptions?.includes(x.id as string) || isReadonly}
                        imagePath="/png/guardrail-prompt.png"
                        handleClick={() => onCheck(x)}
                        onEdit={onEdit}
                    />
                ))}
            </div>
            {level !== GuardrailBindingLevelType.WORKSPACE && selectedGuardrails?.length > 0 && (
                <>
                    <hr className="border-b dark:border-gray-700 my-2" />
                    <div className="max-h-[30%]">
                        <p className="font-medium text-sm text-blue-500 dark:text-blue-500 mb-2">
                            Associated Guardrails
                        </p>
                        <div className="h-[85%] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-4">
                                {selectedGuardrails?.map(item => (
                                    <div key={item.id} className="flex items-center gap-x-2">
                                        <TruncateCell
                                            className="text-gray-800 dark:text-gray-100"
                                            value={item.name}
                                            length={45}
                                        />
                                        <Badge variant={getBadgeVariant(item.level)} className="text-xs px-2 py-0.5">
                                            {item.badge}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
