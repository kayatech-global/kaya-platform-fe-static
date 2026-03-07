/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * -----------------------------------------------------------------------------
 * Page Generation Script
 * -----------------------------------------------------------------------------
 *
 * Usage:
 *   node scripts/generate-page.js <ResourceName>
 *
 * Example:
 *   node scripts/generate-page.js Profile
 *
 * Description:
 *   This script generates a full CRUD page structure for a new resource, including:
 *   - Page component (page.tsx)
 *   - Container component
 *   - Table container component
 *   - Form component
 *   - Custom hook with mock data logic (using resource name)
 *
 * Automation:
 *   - Automatically adds a new menu item to 'Setup configurations' in src/constants/app-constants.ts
 * -----------------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// Helper to convert strings
const toPascalCase = str =>
    str.replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase()).replace(/-/g, '');
const toKebabCase = str =>
    str &&
    str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.toLowerCase())
        .join('-');

// Get resource name from command line
const resourceName = process.argv[2];

if (!resourceName) {
    console.error('Please provide a resource name. Usage: node scripts/generate-page.js <ResourceName>');
    process.exit(1);
}

const pascalName = toPascalCase(resourceName);
const kebabName = toKebabCase(resourceName);
const camelName = resourceName.charAt(0).toLowerCase() + resourceName.slice(1);
// Simple pluralization logic - append 's' if not already
const pluralName = camelName.endsWith('s') ? camelName : `${camelName}s`;
const kebabPluralName = toKebabCase(pluralName);

// Paths
const baseDir = path.join(__dirname, '..', 'src');
const appDir = path.join(baseDir, 'app', 'workspace', '[wid]', kebabPluralName);
const componentsDir = path.join(appDir, 'components');
const hooksDir = path.join(baseDir, 'hooks');

console.log(`Generating files for resource: ${pascalName} (${kebabName})`);
console.log(`Target Directory: ${appDir}`);

// Ensure directories exist
if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });
if (!fs.existsSync(componentsDir)) fs.mkdirSync(componentsDir, { recursive: true });

// --- Templates ---

// 1. Page Component
const pageTemplate = `import React from 'react';
import { ${pascalName}Container } from './components/${kebabName}-container';

function Page() {
    return <${pascalName}Container />;
}

export default Page;
`;

// 2. Container Component
const containerTemplate = `'use client';
import React, { useRef, useState } from 'react';
import ActivityFeed from '@/components/molecules/activity-feed/activity-feed';
import { ${pascalName}TableContainer } from './${kebabName}-table-container';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { cn } from '@/lib/utils';
import { Button } from '@/components';
import AppDrawer from '@/components/molecules/drawer/app-drawer';
import { use${pascalName} } from '@/hooks/use-${kebabName}';
import ${pascalName}Form from './${kebabName}-form';
import { PlatformConfigurationSuiteSkeleton } from '@/components/organisms';
import { CloudCog } from 'lucide-react';

export const ${pascalName}Container = () => {
    const {
        isFetching,
        tableData,
        activityData,
        control,
        isOpen,
        errors,
        isValid,
        isSaving,
        bottomRef,
        onFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        refetch,
    } = use${pascalName}();
    const { isLg, isMobile } = useBreakpoint();

    const pageRef = useRef<HTMLDivElement>(null);
    const [drawerHeight, setDrawerHeight] = useState<number | undefined>(undefined);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);

    const handleClick = () => {
        setDrawerHeight(window.innerHeight - 141);
        setIsDrawerOpen(true);
    };

    const handleCreate = () => {
        setEdit(false);
        setOpen(true);
    };

    const handleEdit = (id: string) => {
        onEdit(id);
        setEdit(true);
        setOpen(true);
    };

    if (isFetching) return <PlatformConfigurationSuiteSkeleton hasCards={false} />;

    return (
        <React.Fragment>
            <div className="metric-page pb-4">
                <div className="flex justify-between gap-x-9">
                    <div
                        ref={pageRef}
                        className={cn('dashboard-left-section flex flex-col w-full', {
                            'gap-y-9': isLg,
                        })}
                    >
                        <${pascalName}TableContainer
                            data={tableData}
                            onFilter={onFilter}
                            onNewButtonClick={() => handleCreate()}
                            onEditButtonClick={handleEdit}
                            onDelete={onDelete}
                            onRecentActivity={handleClick}
                        />
                    </div>
                </div>
            </div>
            {/* Recent activities drawer */}
            <AppDrawer
                open={isDrawerOpen}
                direction={isMobile ? 'bottom' : 'right'}
                isPlainContentSheet
                setOpen={setIsDrawerOpen}
                footer={
                    <div className="flex justify-end">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setIsDrawerOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container')}>
                        <ActivityFeed
                            data={activityData}
                            bottomRef={bottomRef}
                            activityBodyHeight={drawerHeight}
                        />
                    </div>
                }
            />

            {/* New ${pascalName} Drawer */}
            <AppDrawer
                open={isOpen}
                direction="right"
                isPlainContentSheet={false}
                setOpen={setOpen}
                className="custom-drawer-content !w-[633px]"
                dismissible={false}
                headerIcon={<CloudCog />}
                header={isEdit ? 'Edit ${pascalName}' : 'New ${pascalName}'}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant={'secondary'} size={'sm'} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <div>
                             <Button
                                size={'sm'}
                                disabled={!isValid || isSaving}
                                onClick={handleSubmit(onHandleSubmit)}
                            >
                                {isSaving ? 'Saving' : isEdit ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                }
                content={
                    <div className={cn('activity-feed-container p-4')}>
                        <${pascalName}Form
                            register={register}
                            errors={errors}
                            isEdit={isEdit}
                            watch={watch}
                        />
                    </div>
                }
            />
        </React.Fragment>
    );
};
`;

// 3. Table Container Component
const tableContainerTemplate = `'use client';

import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Button, Input } from '@/components';
import DataTable from '@/components/molecules/table/data-table';
import { useForm } from 'react-hook-form';
import { cn, handleNoValue } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { useBreakpoint } from '@/hooks/use-breakpoints';
import { I${pascalName}, I${pascalName}Form } from '@/hooks/use-${kebabName}';
import { ColumnDef, Row } from '@tanstack/react-table';

interface DeleteRecordProps {
    row: Row<I${pascalName}>;
    onDelete: (id: string) => void;
}

const DeleteRecord = ({ row, onDelete }: DeleteRecordProps) => {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        onDelete(row.original.id);
        setOpen(false);
    };

    return (
        <>
            <Button
                className="w-full sm:w-max cursor-pointer"
                variant="link"
                size="icon"
                onClick={() => setOpen(true)}
            >
                <Trash2 size={18} className="text-gray-500 dark:text-gray-200" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-y-auto max-h-[80%]">
                    <DialogHeader>
                        <DialogTitle>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure, do you want to delete this?
                            </p>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 p-3">
                        <Button variant={'secondary'} size="sm" onClick={() => setOpen(false)}>
                            No
                        </Button>
                        <Button variant={'primary'} size="sm" onClick={handleDelete}>
                            Yes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const generateColumns = (onEditButtonClick: (id: string) => void, onDelete: (id: string) => void): ColumnDef<I${pascalName}>[] => {
    const columns: ColumnDef<I${pascalName}>[] = [
        {
            accessorKey: 'name',
            enableSorting: true,
            header: () => <div className="w-full text-left">Name</div>,
            cell: ({ row }) => <div>{handleNoValue(row.getValue('name'))}</div>,
        },
        {
            accessorKey: 'description',
            enableSorting: false,
            header: () => <div className="w-full text-left">Description</div>,
            cell: ({ row }) => <div>{handleNoValue(row.getValue('description'))}</div>,
        },
        {
            accessorKey: 'id',
            enableSorting: false,
            header: () => <div className="w-full text-left"></div>,
            cell: ({ row }) => (
                <div className="flex items-center gap-x-4">
                    <DeleteRecord row={row} onDelete={onDelete} />
                    <Pencil
                        size={18}
                        className="text-gray-500 cursor-pointer dark:text-gray-200"
                        onClick={() => onEditButtonClick(row.getValue('id'))}
                    />
                </div>
            ),
        },
    ];
    return columns;
};

interface ${pascalName}TableContainerProps {
    data: I${pascalName}[];
    onFilter: (data: I${pascalName}Form) => void;
    onNewButtonClick: () => void;
    onEditButtonClick: (id: string) => void;
    onDelete: (id: string) => void;
    onRecentActivity: () => void;
}

export const ${pascalName}TableContainer = ({
    data,
    onFilter,
    onNewButtonClick,
    onEditButtonClick,
    onDelete,
    onRecentActivity,
}: ${pascalName}TableContainerProps) => {
    const { register, handleSubmit } = useForm<I${pascalName}Form>({ mode: 'onChange' });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const { isMobile } = useBreakpoint();

    const onHandleSubmit = (formData: I${pascalName}Form) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        const timer = setTimeout(() => {
            onFilter(formData);
        }, 1000);
        setDebounceTimer(timer);
    };

    const columns = generateColumns(onEditButtonClick, onDelete);

    return (
        <div className="grid gap-8">
            <DataTable
                columns={columns}
                data={data}
                searchColumnName="name"
                showFooter
                defaultPageSize={isMobile ? 5 : 10}
                showTableSearch={false}
                manualSpan={true}
                tableHeader={
                    <div className="flex justify-between items-center w-full">
                        <Input
                            {...register('search')}
                            placeholder="Search by Name"
                            className="max-w-sm"
                            onKeyUp={handleSubmit(onHandleSubmit)}
                        />
                        <div className="flex ml-2 justify-end items-center gap-4 w-full">
                            <Button size={'sm'} onClick={onNewButtonClick}>
                                New ${pascalName}
                            </Button>
                            <Button variant={'link'} size={'sm'} onClick={onRecentActivity} className="hidden">
                                Recent Activities
                            </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
`;

// 4. Form Component
const formTemplate = `import { Input, Textarea } from '@/components';
import { validateSpaces } from '@/lib/utils';
import { validateField } from '@/utils/validation';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { I${pascalName}Form } from '@/hooks/use-${kebabName}';

interface ${pascalName}FormProps {
    register: UseFormRegister<I${pascalName}Form>;
    errors: FieldErrors<I${pascalName}Form>;
    isEdit: boolean;
    watch: UseFormWatch<I${pascalName}Form>;
}

const ${pascalName}Form = ({ register, errors, isEdit, watch }: ${pascalName}FormProps) => {
    const descriptionValidate = validateField('Description', {
        required: { value: true },
        minLength: { value: 5 },
    });

    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="col-span-1">
                <Input
                    {...register('name', {
                        required: {
                            value: true,
                            message: 'Please enter a name',
                        },
                        validate: value => validateSpaces(value, 'Name'),
                    })}
                    placeholder="Enter Name"
                    label="Name"
                    isDestructive={!!errors?.name?.message}
                    supportiveText={errors?.name?.message}
                />
            </div>
            <div className="col-span-1">
                <Textarea
                    {...register('description', {
                        required: descriptionValidate.required,
                        minLength: descriptionValidate.minLength,
                    })}
                    label="Description"
                    placeholder="Enter description"
                    isDestructive={!!errors?.description?.message}
                    supportiveText={errors?.description?.message}
                />
            </div>
        </div>
    );
};

export default ${pascalName}Form;
`;

// 5. Hook Component
const hookTemplate = `import { useState, useEffect } from 'react';
import { useForm, UseFormRegister, FieldErrors, UseFormWatch, Control, UseFormSetValue, UseFormHandleSubmit } from 'react-hook-form';
import { toast } from 'sonner';
import { ActivityColorCode } from '@/enums/activity-color-code-type';
import { useInView } from 'react-intersection-observer';
import { ActivityProps } from '@/components';

export interface I${pascalName} {
    id: string;
    name: string;
    description: string;
}

export interface I${pascalName}Form {
    id?: string;
    name: string;
    description: string;
    search?: string;
}

// Mock Data
const MOCK_DATA: I${pascalName}[] = [
    { id: '1', name: '${pascalName} A', description: 'Sample Description A' },
    { id: '2', name: '${pascalName} B', description: 'Sample Description B' },
    { id: '3', name: '${pascalName} C', description: 'Sample Description C' },
];

const MOCK_ACTIVITY_DATA: ActivityProps[] = [
    {
        title: '${pascalName} Created',
        description: 'New ${pascalName} added',
        date: '2024/02/09',
        colorCode: ActivityColorCode.Green,
    },
    {
        title: '${pascalName} Updated',
        description: '${pascalName} modified',
        date: '2024/02/08',
        colorCode: ActivityColorCode.Blue,
    },
];

export const use${pascalName} = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [tableData, setTableData] = useState<I${pascalName}[]>([]);
    const [allData, setAllData] = useState<I${pascalName}[]>([]); // Store complete list for filtering
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Initial Data Load
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setTableData(MOCK_DATA);
            setAllData(MOCK_DATA);
            setLoading(false);
        }, 800);
    }, []);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isValid },
    } = useForm<I${pascalName}Form>({
        mode: 'all',
        defaultValues: {
            name: '',
            description: '',
        },
    });

    // Reset form when drawer closes/opens
    useEffect(() => {
        if (!isOpen) {
            reset({
                id: undefined,
                name: '',
                description: '',
            });
        }
    }, [isOpen]);

    const { ref } = useInView({ threshold: 0.5 });

    const onFilter = (filter: I${pascalName}Form) => {
        if (!filter?.search) {
            setTableData(allData);
            return;
        }
        const lowerSearch = filter.search.toLowerCase();
        const filtered = allData.filter(item => 
            item.name.toLowerCase().includes(lowerSearch) || 
            item.description.toLowerCase().includes(lowerSearch)
        );
        setTableData(filtered);
    };

    const onEdit = (id: string) => {
        const item = allData.find(x => x.id === id);
        if (item) {
            setValue('id', item.id);
            setValue('name', item.name);
            setValue('description', item.description);
        }
    };

    const onHandleSubmit = (data: I${pascalName}Form) => {
        setIsSaving(true);
        setTimeout(() => {
            if (data.id) {
                // Update
                const updated = allData.map(item => item.id === data.id ? { ...data, id: data.id } : item) as I${pascalName}[];
                setTableData(updated);
                setAllData(updated);
                toast.success('${pascalName} updated successfully');
            } else {
                // Create
                const newItem: I${pascalName} = { 
                    name: data.name,
                    description: data.description,
                    id: Math.random().toString(36).substr(2, 9) 
                };
                const updated = [...allData, newItem];
                setTableData(updated);
                setAllData(updated);
                toast.success('${pascalName} created successfully');
            }
            setIsSaving(false);
            setOpen(false);
        }, 1000);
    };

    const onDelete = (id: string) => {
        const updated = allData.filter(item => item.id !== id);
        setTableData(updated);
        setAllData(updated);
        toast.success('${pascalName} deleted successfully');
    };

    const refetch = () => {
        // Re-fetch logic (mock)
    };

    return {
        isFetching: loading,
        tableData,
        activityData: MOCK_ACTIVITY_DATA,
        control,
        isOpen,
        errors,
        isValid,
        isSaving,
        onFilter,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        setOpen,
        onDelete,
        refetch,
        bottomRef: ref,
    };
};
`;

// --- Write Files ---

const files = [
    {
        path: path.join(appDir, 'page.tsx'),
        content: pageTemplate,
    },
    {
        path: path.join(componentsDir, `${kebabName}-container.tsx`),
        content: containerTemplate,
    },
    {
        path: path.join(componentsDir, `${kebabName}-table-container.tsx`),
        content: tableContainerTemplate,
    },
    {
        path: path.join(componentsDir, `${kebabName}-form.tsx`),
        content: formTemplate,
    },
    {
        path: path.join(hooksDir, `use-${kebabName}.tsx`),
        content: hookTemplate,
    },
];

files.forEach(file => {
    fs.writeFileSync(file.path, file.content);
    console.log(`Created: ${file.path}`);
});

// --- Helper to update app-constants.ts ---
const updateAppConstants = () => {
    const constantsPath = path.join(baseDir, 'constants', 'app-constants.ts');

    if (!fs.existsSync(constantsPath)) {
        console.warn('⚠️ Warning: app-constants.ts not found. Menu item not added.');
        return;
    }

    let content = fs.readFileSync(constantsPath, 'utf8');

    // Check if item already exists
    if (content.includes(`id: '${kebabPluralName}'`)) {
        console.log('ℹ️ Menu item already exists in app-constants.ts');
        return;
    }

    // New Menu Item
    const newItem = `
            {
                id: '${kebabPluralName}',
                title: '${pascalName}s',
                url: '/workspace/[wid]/${kebabPluralName}',
                icon: 'Layers',
                isSingleLink: true,
            },`;

    // Find the insertion point (after api-configurations items)
    // We look for the closing brace of 'api-configurations' item
    const searchPattern = /id:\s*'api-configurations',[\s\S]*?\},/;

    if (content.match(searchPattern)) {
        content = content.replace(searchPattern, match => `${match}${newItem}`);
        fs.writeFileSync(constantsPath, content, 'utf8');
        console.log('✅ Added menu item to app-constants.ts');
    } else {
        console.warn('⚠️ Could not find insertion point (api-configurations) in app-constants.ts');
    }
};

updateAppConstants();

console.log('Done! Page generation complete.');
