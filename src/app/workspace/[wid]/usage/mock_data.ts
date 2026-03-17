import { OverallUsageType, UnitType, UsageUnitType } from '@/enums';
import { IConsumption, OverallUsageResponse, IWorkflowExecution } from '@/models';
import moment from 'moment';

export const mock_overall_usage: OverallUsageResponse = {
    quota: {
        storage: {
            limit: 100,
            unit: UnitType.GIGABYTE,
            unitType: UsageUnitType.SIZE,
        },
        credits: {
            limit: 50000,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
        },
        tokens: {
            limit: 1000000,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
        },
    },
    usage: [
        {
            type: OverallUsageType.STORAGE,
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            usage: 45 * 1024 * 1024, // 45GB
            month: moment().month() + 1,
            year: moment().year(),
        },
        {
            type: OverallUsageType.STORAGE,
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            usage: 40 * 1024 * 1024, // 40GB
            month: moment().subtract(1, 'month').month() + 1,
            year: moment().subtract(1, 'month').year(),
        },
        {
            type: OverallUsageType.CREDITS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 15400,
            month: moment().month() + 1,
            year: moment().year(),
        },
        {
            type: OverallUsageType.CREDITS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 12000,
            month: moment().subtract(1, 'month').month() + 1,
            year: moment().subtract(1, 'month').year(),
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 450000,
            month: moment().month() + 1,
            year: moment().year(),
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 380000,
            month: moment().subtract(1, 'month').month() + 1,
            year: moment().subtract(1, 'month').year(),
        },
    ],
};

export const mock_consumption: IConsumption = {
    storage: mock_overall_usage.usage.filter(x => x.type === OverallUsageType.STORAGE),
    credits: mock_overall_usage.usage.filter(x => x.type === OverallUsageType.CREDITS),
    tokens: [
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 150000,
            month: moment().month() + 1,
            year: moment().year(),
            model: 'Gemini 1.5 Pro',
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 200000,
            month: moment().month() + 1,
            year: moment().year(),
            model: 'GPT-4o',
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 100000,
            month: moment().month() + 1,
            year: moment().year(),
            model: 'Claude 3.5 Sonnet',
        },
    ],
};

export const mock_monthly_usage: IConsumption = {
    tokens: [
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 450000,
            month: moment().month() + 1,
            year: moment().year(),
        },
        ...Array.from({ length: 11 }).map((_, i) => ({
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: Math.floor(Math.random() * 500000) + 200000,
            month: moment().subtract(i + 1, 'month').month() + 1,
            year: moment().subtract(i + 1, 'month').year(),
            model: ['Gemini 1.5 Pro', 'GPT-4o', 'Claude 3.5 Sonnet'][Math.floor(Math.random() * 3)],
        })),
    ],
    credits: Array.from({ length: 12 }).map((_, i) => ({
        type: OverallUsageType.CREDITS,
        unit: UnitType.DEFAULT,
        unitType: UsageUnitType.COUNT,
        usage: Math.floor(Math.random() * 20000) + 5000,
        month: moment().subtract(i, 'month').month() + 1,
        year: moment().subtract(i, 'month').year(),
    })),
};

export const mock_workflow_executions: IWorkflowExecution[] = [
    {
        workflowId: 'wf-1',
        workflowName: 'Customer Support Bot',
        executionCount: 1250,
        month: moment().month() + 1,
        year: moment().year(),
    },
    {
        workflowId: 'wf-2',
        workflowName: 'Content Generator',
        executionCount: 850,
        month: moment().month() + 1,
        year: moment().year(),
    },
    {
        workflowId: 'wf-3',
        workflowName: 'Data Extractor',
        executionCount: 450,
        month: moment().month() + 1,
        year: moment().year(),
    },
    {
        workflowId: 'wf-4',
        workflowName: 'Email Summarizer',
        executionCount: 2100,
        month: moment().month() + 1,
        year: moment().year(),
    },
];
