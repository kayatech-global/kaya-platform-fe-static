import { OverallUsageType, UnitType, UsageUnitType } from '@/enums';

export const mockOverallUsageResponse = {
    overall: {
        storage: { used: 1000, quota: { limit: 5000, unit: 'GB', unitType: 'size' } },
        tokens: { used: 2000, quota: { limit: 10000, unit: 'count', unitType: 'count' } },
        credits: { used: 100, quota: { limit: 500, unit: 'count', unitType: 'count' } },
    },
    consumption: {
        storage: [{ month: '2025-01', consumption: 800 }],
        tokens: [{ month: '2025-01', consumption: 1500 }],
        credits: [{ month: '2025-01', consumption: 80 }],
    },
    monthlyUsage: {
        tokens: [{ month: '2025-01', consumption: 1500 }],
        credits: [{ month: '2025-01', consumption: 80 }],
    },
    workflowExecutions: [
        {
            workflowId: '0001',
            workflowName: 'Workflow 5',
            executionCount: 1,
            month: 1,
            year: 2025,
        },
        {
            workflowId: '0002',
            workflowName: 'Workflow 6',
            executionCount: 16,
            month: 2,
            year: 2025,
        },
    ],
};

export const mockOverallUsages = {
    quota: {
        storage: {
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            limit: 209715200,
        },
        credits: {
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            limit: 500000,
        },
        tokens: {
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            limit: 250000,
        },
    },
    usage: [
        {
            type: OverallUsageType.CREDITS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 331.90052565812266,
            month: 1,
            year: 2025,
        },
        {
            type: OverallUsageType.CREDITS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 139.0524172566186,
            month: 2,
            year: 2025,
        },
        {
            type: OverallUsageType.STORAGE,
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            usage: 79.82236648417768,
            month: 12,
            year: 2024,
        },
        {
            type: OverallUsageType.STORAGE,
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            usage: 2303.3512708168755,
            month: 1,
            year: 2025,
        },
        {
            type: OverallUsageType.STORAGE,
            unit: UnitType.KILOBYTE,
            unitType: UsageUnitType.SIZE,
            usage: 1033.169182329867,
            month: 2,
            year: 2025,
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 327308,
            month: 1,
            year: 2025,
        },
        {
            type: OverallUsageType.TOKENS,
            unit: UnitType.DEFAULT,
            unitType: UsageUnitType.COUNT,
            usage: 160739,
            month: 2,
            year: 2025,
        },
    ],
};
