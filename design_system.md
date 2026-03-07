# Design System & AI Guidelines

This document serves as the primary source of truth for AI assistants (Cursor, Windsurf, Google Antigravity, etc.) generating code in this repository.
Follow these guidelines strictly to ensure consistency, maintainability, and visual harmony across all pages and features.

## 1. Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `tailwindcss-animate`
- **Component Library:** shadcn/ui
- **Icons:** `lucide-react` and `@remixicon/react`
- **Data Fetching:** React Query (`react-query`)
- **Forms:** React Hook Form (`react-hook-form`) + Zod validation

## 2. Directory Structure & Aliases

When importing, prioritize using path aliases over relative paths.

- `components`: `@/components/atoms` (shadcn custom atoms)
- `utils`: `@/lib/utils`
- `ui`: `@/components/atoms`
- `lib`: `@/lib`
- `hooks`: `@/hooks`

**Important Rule:** Always check if a component already exists in `@/components/atoms` before creating a new one or using native HTML elements (e.g., use `<Button>` instead of `<button>`).

## 3. Styling & Theming (Tailwind CSS)

All styling must be done using Tailwind CSS utility classes. Avoid writing custom CSS unless absolutely necessary.

### Colors

We use a predefined set of colors configured in `tailwind.config.ts`.

- **Theme semantic colors:** `bg-background`, `text-foreground`, `bg-primary`, `bg-secondary`, `bg-muted`, `bg-accent`, `bg-destructive`.
- **System colors:** We have custom palettes for `blue`, `sky`, `amber`, `green`, `red`, and `gray` (e.g., `text-blue-600`, `bg-amber-100`).

### Typography

Use the custom responsive font sizes defined in the tailwind config:

- `text-xs`, `text-sm`, `text-md`, `text-lg`, `text-xl`
- Desktop sizes: `text-d-xs`, `text-d-sm`, `text-d-md`, `text-d-lg`, `text-d-xl`

### Class Management

When dynamically applying Tailwind classes, **ALWAYS** use the `cn` utility from `@/lib/utils`.

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-classes", isTrue && "conditional-classes")}>
```

## 4. UI Components (shadcn/ui)

Our base UI components are built with shadcn/ui and Radix UI primitives.

- They are located in `src/components/atoms`.
- **Do not modify** the base atoms unless there is a global design change approved by the team.
- Combine atoms to create complex molecules in `src/components/[feature]`.

## 5. Forms and Validation

- All forms must use `react-hook-form` connected with `@hookform/resolvers/zod`.
- Define Zod schemas for all form payloads to ensure strict runtime type safety.
- Use the shadcn `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl` components to build accessible forms.

## 6. Code Quality & Standards

- **TypeScript:** Strict typing is mandatory. Avoid using `any`. Define interfaces/types in `src/models` or alongside the component.
- **Client vs Server Components:** Next.js App Router defaults to Server Components. Only add `"use client"` at the top of the file if the component requires React hooks (useState, useEffect), event listeners, or browser APIs.
- **Mock Data First:** If the backend API is not ready, implement the UI with realistic mock data in the `src/mocks` directory. Do not leave the UI in a broken state.

## 7. AI Instructions for New Pages/Features

Whenever asked to create a new page or feature, follow these steps:

1. **Analyze Requirements:** Understand the layout and required interactions.
2. **Identify Reusable Components:** Check `src/components/atoms` for existing building blocks (Buttons, Inputs, Dialogs, Tables).
3. **Draft the Types/Schema:** If handling data, define the TypeScript interface or Zod schema first.
4. **Build the Layout:** Create the page structure using Tailwind flex/grid methodologies.
5. **Implement Logic:** Hook up state management or `react-query` data fetchers.
6. **Apply Styling:** Use the design system colors and typography. Ensure responsive design (`sm:`, `md:`, `lg:` breakpoints).
7. **Verify:** Ensure no TypeScript errors and that ESLint/Prettier rules are respected.

## 8. Design System API Reference

Never generate raw HTML for UI elements. Always use the components defined below.
Import path for all components: `@/components/atoms` (e.g., `import { Button } from "@/components/atoms/button"`)

### 8.1. Button

**Description:** Primary action element.
**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'semi-secondary' | 'ghost' | 'destructive' | 'link' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'icon';
    asChild?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    loading?: boolean;
}
```

### 8.2. Input

**Description:** Standard text input field.
**Props:**

```typescript
interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    labelInfo?: string | React.ReactNode;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    containerClassName?: string;
    helperInfo?: string | React.ReactNode;
    trailingIconClass?: string;
    loading?: boolean;
}
```

### 8.3. Select

**Description:** Native select element wrapper with custom styling and capabilities.
**Props:**

```typescript
export interface OptionModel {
    name: string;
    value: string | number;
    disabled?: boolean;
    isHidden?: boolean;
    meta?: unknown;
}

interface SelectProps extends React.ComponentProps<'select'> {
    options: OptionModel[];
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    currentValue?: string | number;
    hasClear?: boolean;
    isVault?: boolean;
    onClear?: () => void;
    containerClassName?: string;
    helperInfo?: string;
}
```

### 8.4. Accordion
**Description:** UI component for Accordion.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.5. ActionTextarea
**Description:** UI component for ActionTextarea.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'textarea'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    actionLabel: string;
    actionClassName?: string;
    onAction: () => void;
    actionDisabled?: boolean;
    tooltipContent?: React.ReactNode;
}
```

### 8.6. Alert
**Description:** UI component for Alert.
**Props:**
```typescript
interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    message: string | React.ReactNode;
    className?: string;
    noBorder?: boolean;
    noBackground?: boolean;
    small?: boolean;
}
```

### 8.7. Avatar
**Description:** UI component for Avatar.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.8. Badge
**Description:** UI component for Badge.
**Props:**
```typescript
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    /**
     * Use Test Studio specific badge styling.
     */
    testStudio?: boolean;
}
```

### 8.9. BannerInfo
**Description:** UI component for BannerInfo.
**Props:**
```typescript
interface BannerInfoProps {
    icon?: string;
    label: string | React.ReactNode;
}
```

### 8.10. Breadcrumb
**Description:** UI component for Breadcrumb.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.11. Calendar
**Description:** UI component for Calendar.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.12. Card
**Description:** UI component for Card.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.13. Carousel
**Description:** UI component for Carousel.
**Props:**
```typescript
type CarouselProps = {
    opts?: CarouselOptions;
    plugins?: CarouselPlugin;
    orientation?: 'horizontal' | 'vertical';
    setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
    carouselRef: ReturnType<typeof useEmblaCarousel>[0];
    api: ReturnType<typeof useEmblaCarousel>[1];
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
} & CarouselProps;
```

### 8.14. Chart
**Description:** UI component for Chart.
**Props:**
```typescript
type ChartContextProps = {
    config: ChartConfig;
};
```

### 8.15. Checkbox
**Description:** UI component for Checkbox.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.16. CodeDisplayBox
**Description:** UI component for CodeDisplayBox.
**Props:**
```typescript
type CodeDisplayBoxProps = {
    icon: LucideIcon;
    title: string;
    content: string;
    variant?: CodeDisplayBoxVariant;
    maxHeight?: string;
};
```

### 8.17. CodeSandboxSvg
**Description:** UI component for CodeSandboxSvg.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.18. Collapsible
**Description:** UI component for Collapsible.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.19. Command
**Description:** UI component for Command.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.20. DashboardDataCard
**Description:** UI component for DashboardDataCard.
**Props:**
```typescript
export interface DashboardDataCardProps {
    title: string | React.ReactNode;
    tooltipContent?: string;
    value: string | number | React.ReactNode;
    description: string;
    trendValue: string | number;
    trendColor: string;
    Icon: React.ElementType;
    TrendIcon: React.ElementType;
    showTrendIcon?: boolean;
    width?: number;
    type?: OverallUsageType;
    info?: string;
}
```

### 8.21. DatabaseSelector
**Description:** UI component for DatabaseSelector.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    disableCreate?: boolean;
    loadingDatabases?: boolean;
    hasClear?: boolean;
    databaseType?: DatabaseItemType;
    hookForm?: IHookForm;
    onClear?: () => void;
    onRefetch: (id?: unknown) => void;
}
```

### 8.22. DatePicker
**Description:** UI component for DatePicker.
**Props:**
```typescript
type CommonProps = {
    label?: string;
    placeholder?: string;
    triggerInputClassName?: string;
    isDestructive?: boolean;
    supportiveText?: string;
    disabledTrigger?: boolean;
    onSelect?: (date: any) => void;
    onBlur?: () => void;
} & Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect'>;

type DatePickerProps =
```

### 8.23. DaysOfWeekSelector
**Description:** UI component for DaysOfWeekSelector.
**Props:**
```typescript
interface DaysOfWeekSelectorProps {
    label?: string;
    value?: DaysOfWeekType[];
    disabled?: boolean;
    onValueChange?: (days: DaysOfWeekType[]) => void;
}
```

### 8.24. DetailAlert
**Description:** UI component for DetailAlert.
**Props:**
```typescript
interface DetailAlertProps {
    variant?: AlertVariant;
    title?: string;
    message: string | React.ReactNode;
    details?: React.ReactNode;
    className?: string;
}
```

### 8.25. Dialog
**Description:** UI component for Dialog.
**Props:**
```typescript
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    overlayClassname?: string;
    hideCloseButtonClass?: string;
    autoClose?: boolean;
    rightIcon?: React.ReactNode;
}
```

### 8.26. DropdownMenu
**Description:** UI component for DropdownMenu.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.27. DynamicObjectBuilder
**Description:** UI component for DynamicObjectBuilder.
**Props:**
```typescript
type ElementProps = React.ComponentProps<'div'>;

interface DynamicObjectProps extends ElementProps {
    length: number;
    containerTop?: number;
    containerHeight?: number;
    children: React.ReactNode;
}

interface DynamicObjectBodyProps extends ElementProps {
    disabledAdd?: boolean;
    children: React.ReactNode;
    onAdd: () => void;
}

interface DynamicObjectFieldProps extends ElementProps {
    rowId: unknown;
    hiddenClose?: boolean;
    disabledClose?: boolean;
    forceValidation?: boolean;
    removeRow: (rowId: unknown) => void;
}

interface DynamicObjectFieldItemProps extends ElementProps {
    label?: string;
    helperInfo?: React.ReactNode;
    helperInfoWidthClass?: string;
    labelClassName?: string;
    iconClassName?: string;
    iconSize?: number;
    children: React.ReactNode;
}
```

### 8.28. EditableTableCell
**Description:** UI component for EditableTableCell.
**Props:**
```typescript
type EditableTableCellProps = {
    isEditing: boolean;
    value: string;
    displayValue?: string;
    onChange: (value: string) => void;
    rows?: number;
    maxWidth?: string;
};
```

### 8.29. EditorButton
**Description:** UI component for EditorButton.
**Props:**
```typescript
type EditorButtonProps = {
    /**
     * Icon can be:
     * - Remix icon class (string starting with "ri-")
     * - Image path (.png, .svg, .jpg)
     * - Lucide icon component (either <Save /> or Save)
     * - Custom React node (inline SVG)
     */
    icon?: string | LucideIcon | React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    children: React.ReactNode; // Label or any JSX content
    textClassName?: string;
};
```

### 8.30. EmbeddingSelector
**Description:** UI component for EmbeddingSelector.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    disableCreate?: boolean;
    loadingEmbeddings?: boolean;
    hasClear?: boolean;
    hookForm?: IHookForm;
    onClear?: () => void;
    onRefetch: (id?: unknown) => void;
}
```

### 8.31. ExecutionMetricCard
**Description:** UI component for ExecutionMetricCard.
**Props:**
```typescript
type ExecutionMetricCardProps = {
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    title: string;
    value: string | number;
    subtitle?: ReactNode;
    tooltip?: string;
};
```

### 8.32. ExecutionStatusBadge
**Description:** UI component for ExecutionStatusBadge.
**Props:**
```typescript
type ExecutionStatusBadgeProps = {
    status: TestStatus;
    className?: string;
};
```

### 8.33. ExecutionStepBadge
**Description:** UI component for ExecutionStepBadge.
**Props:**
```typescript
type ExecutionStepBadgeProps = {
    score: number;
    type: ExecutionStepBadgeType;
};
```

### 8.34. FileUploader
**Description:** UI component for FileUploader.
**Props:**
```typescript
interface IFileUploadProps {
    placeholder?: string;
    hideInbuiltUploadHandler?: boolean;
    supportMultiUpload?: boolean;
    value?: File[];
    onChange?: (files: File[]) => void;
    accept?: string | string[];
    onClear?: () => void; // Optional callback when files are cleared
    hasError?: boolean; // Optional prop to show error state
    errorMessage?: string; // Optional error message to display
    disabled?: boolean;
    onFileClick?: () => void;
    toastErrorMessage?:string;
}
```

### 8.35. FilterKeyValueInput
**Description:** UI component for FilterKeyValueInput.
**Props:**
```typescript
interface InputProps {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    register: UseFormRegister<any>;
    namePrefix: string;
    fields: FieldArrayWithId<any, string, 'id'>[];
    remove: (index: number, type: number) => void;
    append: (type: number) => void;
    type?: number;
    control: Control<any, any>;
    hasType?: boolean;
    disabledInputs?: boolean;
    isQueryParams?: boolean;
    isRequired?: boolean;
    isResponseField?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
    list: IMetadataFilterValues[];
    disabledInputsMessage?: string;
    dataTypeOptions?: OptionModel[];
}
```

### 8.36. FormFieldGroup
**Description:** UI component for FormFieldGroup.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.37. Form
**Description:** UI component for Form.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.38. HeaderInput
**Description:** UI component for HeaderInput.
**Props:**
```typescript
interface InputProps {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    register: UseFormRegister<any>;
    namePrefix: string;
    fields: FieldArrayWithId<any, string, 'id'>[];
    remove: (index: number, type: number) => void;
    append: (type: number) => void;
    type?: number;
    control: Control<any, any>;
    hasType?: boolean;
    disabledInputs?: boolean;
    isQueryParams?: boolean;
    isRequired?: boolean;
    isResponseField?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
    typePlaceholder?: string;
    list: IHeaderValues[];
    onInputsValid?: () => void;
    className?: string;
    useTextarea?: boolean;
    textareaPlaceholder?: string;
    errors?: FieldErrors<any>;
    isIncludeSecrets?: boolean;
    loadingSecrets?: boolean;
    secrets?: OptionModel[];
    watch?: UseFormWatch<any>;
    customNameValidator?: (value: string, index?: number) => string | true;
    customValueValidator?: (value: string, index?: number) => string | true;
    onSecretRefetch?: () => void;
}
```

### 8.39. IconSwitch
**Description:** UI component for IconSwitch.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.40. Label
**Description:** UI component for Label.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.41. LoadingPlaceholder
**Description:** UI component for LoadingPlaceholder.
**Props:**
```typescript
interface LoadingPlaceholderProps {
    text: string;
    className?: string;
    size?: number;
    width?: number;
    height?: number;
}
```

### 8.42. MaskedInput
**Description:** UI component for MaskedInput.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    initialValue?: string;
    onMaskChange: (value: string) => void;
}
```

### 8.43. Metadata
**Description:** UI component for Metadata.
**Props:**
```typescript
interface InputProps {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    namePrefix: string;
    fields: FieldArrayWithId<any, string, 'id'>[];
    control: Control<any, any>;
    disabledInputs?: boolean;
    disabledAdd?: boolean;
    isRequired?: boolean;
    namePlaceholder?: string;
    valuePlaceholder?: string;
    list: IWorkspaceMetadata[];
    className?: string;
    errors?: FieldErrors<any>;
    metadataList: IOption[];
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    remove: (index: number) => void;
    append: () => void;
    onCreate: (value: string) => void;
}
```

### 8.44. MultiSelect
**Description:** UI component for MultiSelect.
**Props:**
```typescript
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
```

### 8.45. PermissionDeniedDialog
**Description:** UI component for PermissionDeniedDialog.
**Props:**
```typescript
interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}
```

### 8.46. Popover
**Description:** UI component for Popover.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.47. Progress
**Description:** UI component for Progress.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.48. RadioGroup
**Description:** UI component for RadioGroup.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.49. RadioList
**Description:** UI component for RadioList.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.50. ReRankingSelector
**Description:** UI component for ReRankingSelector.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    disableCreate?: boolean;
    loadingReRanking?: boolean;
    hasClear?: boolean;
    hookForm?: IHookForm;
    onClear?: () => void;
    onRefetch: (id?: unknown) => void;
}
```

### 8.51. ScrollArea
**Description:** UI component for ScrollArea.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.52. SecretInput
**Description:** UI component for SecretInput.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'input'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    containerClassName?: string;
    helperInfo?: string | React.ReactNode;
    trailingIconClass?: string;
    loading?: boolean;
}
```

### 8.53. SelectV2
**Description:** UI component for SelectV2.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.54. Separator
**Description:** UI component for Separator.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.55. Sheet
**Description:** UI component for Sheet.
**Props:**
```typescript
interface SheetContentProps
```

### 8.56. Skeleton
**Description:** UI component for Skeleton.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.57. Slider
**Description:** UI component for Slider.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.58. Sonner
**Description:** UI component for Sonner.
**Props:**
```typescript
type ToasterProps = React.ComponentProps<typeof Sonner>
```

### 8.59. Spinner
**Description:** UI component for Spinner.
**Props:**
```typescript
interface ISmallSpinnerProps {
    classNames?: string;
}
```

### 8.60. Switch
**Description:** UI component for Switch.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.61. Tabs
**Description:** UI component for Tabs.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.62. TagsInput
**Description:** UI component for TagsInput.
**Props:**
```typescript
interface TagsInputProps {
    name: string;
    control: Control<any>;
    rules?: any;
    label?: string;
    disabled?: boolean;
    helperInfo?: string;
}
```

### 8.63. TestCaseNumberBadge
**Description:** UI component for TestCaseNumberBadge.
**Props:**
```typescript
type TestCaseNumberBadgeProps = {
    rowIndex: number;
    testMethod: TestCaseMethod;
};
```

### 8.64. Textarea
**Description:** UI component for Textarea.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'textarea'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    helperInfo?: string;
}
```

### 8.65. TimePicker
**Description:** UI component for TimePicker.
**Props:**
```typescript
interface TimePickerProps extends React.ComponentProps<'input'> {
    value?: string;
    label?: string;
    placeholder?: string;
    triggerInputClassName?: string;
    isDestructive?: boolean;
    supportiveText?: string;
    onValueChange?: (time: any) => void;
}
```

### 8.66. ToggleGroup
**Description:** UI component for ToggleGroup.
**Props:**
```typescript
interface BaseToggleGroupProps {
    items?: ToggleGroupItem[];
    className?: string;
}

type ToggleGroupProps = BaseToggleGroupProps &
```

### 8.67. Tooltip
**Description:** UI component for Tooltip.
*(Uses standard HTML/Radix props or inherits props directly)*

### 8.68. TransparentInput
**Description:** UI component for TransparentInput.
**Props:**
```typescript
interface TransparentInputProps extends React.ComponentProps<'input'> {
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    optOutDarkTheme?: boolean;
}
```

### 8.69. TruncateCell
**Description:** UI component for TruncateCell.
**Props:**
```typescript
interface TruncateCellProps {
    value: string;
    length: number;
    className?: string;
    isDefault?: boolean;
    side?: 'left' | 'top' | 'right' | 'bottom';
    align?: 'center' | 'start' | 'end';
}
```

### 8.70. VariablePicker
**Description:** UI component for VariablePicker.
**Props:**
```typescript
interface VariablePickerProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    hasClear?: boolean;
    isVault?: boolean;
    containerClassName?: string;
    helperInfo?: string;
    forceRender: number;
    variables: ISharedItem[] | undefined;
    idField?: string;
    labelField: string;
    valueField: string;
    typeField: string;
    index: number;
    setForceRender: Dispatch<SetStateAction<number>>;
    setValue: UseFormSetValue<any>;
    trigger: UseFormTrigger<any>;
    watch: UseFormWatch<any>;
    onClear?: () => void;
}
```

### 8.71. VariableValuePicker
**Description:** UI component for VariableValuePicker.
**Props:**
```typescript
interface VariableValuePickerProps {
    fieldType: any;
    fieldName: string;
    required?: string;
    errorMessage?: any;
    label?: string;
    placeholder?: string;
    data: {
        type: string | undefined;
        value: any;
    };
    control: Control<any, any>;
    disabled?: boolean;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    trigger: UseFormTrigger<any>;
}
```

### 8.72. VaultSelector
**Description:** UI component for VaultSelector.
**Props:**
```typescript
interface InputProps extends React.ComponentProps<'select'> {
    isDestructive?: boolean;
    label?: string;
    supportiveText?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    placeholder?: string;
    options: OptionModel[];
    currentValue?: string | number;
    disableCreate?: boolean;
    loadingSecrets?: boolean;
    hasClear?: boolean;
    onClear?: () => void;
    onRefetch: () => void;
    helperInfo?: string;
}
```

