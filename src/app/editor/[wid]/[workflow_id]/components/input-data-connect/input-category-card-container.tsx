import React from 'react';
import { InputCategoryTypeCard } from './input-category-type-card';
import { INPUT_CONNECT_CATEGORY_TYPE, InputConnectCategoryType, InputConnectKey } from './input-data-connect-modal';

interface InputCategoryCardContainerProps {
    selectedCategory: InputConnectCategoryType;
    setSelectedCategory: React.Dispatch<React.SetStateAction<InputConnectCategoryType>>;
    selectedCounts: Record<InputConnectKey, number>;
}

export const InputCategoryCardContainer = ({
    selectedCategory,
    setSelectedCategory,
    selectedCounts,
}: InputCategoryCardContainerProps) => {
    return (
        <div className="w-[210px] flex flex-col gap-y-[10px]">
            {INPUT_CONNECT_CATEGORY_TYPE.map(categoryType => (
                <InputCategoryTypeCard
                    key={String(categoryType.categoryKey)}
                    category={categoryType}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedCounts={selectedCounts}
                />
            ))}
        </div>
    );
};
