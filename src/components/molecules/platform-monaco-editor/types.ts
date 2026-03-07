// types.ts

export interface IntellisenseOption {
    label: string;
    value: string;
    children?: IntellisenseOption[];
}

export interface IntellisenseCategory {
    name: string;
    options: IntellisenseOption[];
}

export enum IntellisenseTools {
    Agent = 'Agent',
    API = 'API',
    Variable = 'Variable',
    MCP = 'MCP',
    VectorRAG = 'VectorRAG',
    GraphRAG = 'GraphRAG',
    Metadata = 'Metadata',
    Attribute = 'Attribute',
}

export interface PlatformMonacoEditorProps {
    label?: string;
    value: string;
    readOnly?: boolean;
    height?: string;
    onFocusHeight?: string;
    isDestructive?: boolean;
    placeholder?: string;
    helperInfo?: string;
    disabled?: boolean;
    enableCategoryIcon?: boolean;
    onChange: (value: string) => void;
    intellisenseData: IntellisenseCategory[];
    onRefetchVariables: () => Promise<void>;
    onBlur?: () => void;
    disableIntelligencePopover?: boolean;
    supportiveText?: string;
    language: 'custom-sql' | 'custom-python';
    helperinfo?: string;
}
