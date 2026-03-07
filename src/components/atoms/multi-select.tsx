'use client'
import React from 'react';
import Select, { GroupBase, Props as ReactSelectProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';

interface MultiSelectProps<IOption> extends ReactSelectProps<IOption, true, GroupBase<IOption>> {
    // You can define additional custom props here if necessary
    mainClass?: string;
    menuClass?: string;
    menuPortalClass?: string;
    menuListClass?: string;
    isDestructive?: boolean;
    isCreatable?: boolean;
    isMenuHeightAuto?: boolean;
    onCreateOption?: (value: string) => void;
}

const getClassNames = (
    isDestructive?: boolean,
    mainClass?: string,
    menuClass?: string,
    menuPortalClass?: string,
    menuListClass?: string,
    isMenuHeightAuto?: boolean
) => ({
    control: () =>
        `w-full bg-white !rounded-lg border border-gray-300 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-4 focus:border-blue-300 focus-visible:ring-[#DCE7FE] dark:focus:border-blue-900 dark:focus:focus-visible:ring-[#2f436f58] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700 ${
            isDestructive
                ? `!border-red-300 !focus:border-red-300 !focus-visible:ring-[#FEE4E2] ${mainClass ?? ''}`.trimEnd()
                : (mainClass ?? '')
        }`,
    container: () => 'w-full',
    menuList: () =>
        `bg-white text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-4 focus:border-blue-300 focus-visible:ring-[#DCE7FE] dark:focus:border-blue-900 dark:focus:focus-visible:ring-[#2f436f58] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:border-gray-700 dark:disabled:bg-gray-700 ${
            isMenuHeightAuto ? '' : '!max-h-[200px]'
        } ${menuListClass ?? ''}`.trimEnd(),
    option: () => '!px-0 !py-1 multi-option',
    menu: () => menuClass ?? '',
    menuPortal: () => menuPortalClass ?? '',
    singleValue: () => 'text-xs font-medium text-gray-700 dark:text-gray-100',
    input: () => 'text-xs font-medium text-gray-700 dark:text-gray-100',
    placeholder: () =>
        'text-sm text-gray-900 placeholder:text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-300 opacity-75',
    multiValue: () => '!bg-blue-100 dark:!bg-blue-300 border border-blue-300 dark:border-blue-400 px-2 !rounded-lg',
    multiValueLabel: () => '!text-blue-700 dark:!text-blue-900 !text-xs font-normal',
    multiValueRemove: () => 'text-blue-700 hover:text-red-500 hover:!bg-transparent',
});

const formatOption = (option: { label: string }, format: { context: 'menu' | 'value' }) =>
    format.context === 'value' ? (
        <span>{option.label}</span>
    ) : (
        <span className="block text-sm text-gray-900 dark:text-gray-100 px-4">{option.label}</span>
    );

export const MultiSelect = <IOption extends { value: string; label: string }>({
    mainClass,
    menuClass,
    menuPortalClass,
    menuListClass,
    isDestructive,
    isCreatable,
    isMenuHeightAuto,
    onCreateOption,
    ...props
}: MultiSelectProps<IOption>) => {
    const classNames = getClassNames(
        isDestructive,
        mainClass,
        menuClass,
        menuPortalClass,
        menuListClass,
        isMenuHeightAuto
    );
    const componentProps = {
        ...props,
        classNames,
        formatOptionLabel: formatOption,
    };

    if (isCreatable) {
        return <CreatableSelect {...componentProps} onCreateOption={onCreateOption} />;
    }

    return <Select {...componentProps} />;
};

export default MultiSelect;
