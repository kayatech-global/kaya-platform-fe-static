import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '@/context';
import { IConsumption, IQuota, IWorkflowExecution, OverallUsage, OverallUsageResponse } from '@/models';
import { OverallUsageType, UnitPrefix, UnitType, UsageUnitType } from '@/enums';
import { Coins, HardDrive, TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import {
    convertToFullMonth,
    convertToSnakeCase,
    divideByThousand,
    formatNumberToK,
    formatToShortenedUnit,
    generateNearestChartTopValue,
    generateRandomThemeBasedHexColor,
    generateRandomHexColor,
    groupByMonthAndYear,
    roundedDecimalPlaces,
} from '@/lib/utils';
import { DashboardDataCardProps } from '@/components';
import moment from 'moment';
import {
    ConsumptionChartData,
    CreditUsageData,
    DashboardCardValueProps,
    DashboardDataCardTrendIconProps,
    MonthlyCreditUsageData,
    MonthlyTokenUsageData,
    TokenUsageData,
    WorkFlowExecutionData,
} from '@/app/workspace/[wid]/usage/types/types';
import { ChartConfig } from '@/components/atoms/chart';
import { IMonth } from '@/app/workspace/[wid]/usage/components/workflow-execution-chart-container';
import { useTheme as useNextTheme } from 'next-themes';
import { mock_consumption, mock_monthly_usage, mock_overall_usage, mock_workflow_executions } from '@/app/workspace/[wid]/usage/mock_data';


const fetchOverallUsage = async () => {
    return {
        overall: mock_overall_usage,
        consumption: mock_consumption,
        monthlyUsage: mock_monthly_usage,
        workflowExecutions: mock_workflow_executions,
    };
};

const generateCreditInitialData = () => {
    const monthlyStart = moment().add(1, 'month').subtract(1, 'years');
    const monthlyEnd = moment();

    const monthsDiff = monthlyEnd.diff(monthlyStart, 'months');

    const monthsArray = [];

    for (let i = 0; i <= monthsDiff; i++) {
        monthsArray.push(monthlyStart.clone().add(i, 'months').format('MMMM'));
    }

    return {
        data: monthsArray.map(x => ({ month: x, usage: 0 })),
        config: {
            usage: {
                dataKey: 'usage',
                label: 'Usage',
                color: '#3b7af7',
            },
        },
        xAxisKey: 'month',
        dataKeys: ['usage'],
        info: 'K',
    };
};

const generateTokenInitialData = () => {
    const monthlyStart = moment().add(1, 'month').subtract(1, 'years');
    const monthlyEnd = moment();

    const monthsDiff = monthlyEnd.diff(monthlyStart, 'months');

    const monthsArray = [];

    for (let i = 0; i <= monthsDiff; i++) {
        monthsArray.push(monthlyStart.clone().add(i, 'months').format('MMMM'));
    }

    return {
        data: monthsArray.map(x => ({ month: x, gemini: 0, claude: 0, openAI: 0, mistral: 0 })),
        config: {
            gemini: {
                label: 'Gemini',
                color: '#1d5bd6',
            },
            claude: {
                label: 'Claude',
                color: '#316fed',
            },
            openAI: {
                label: 'OpenAI',
                color: '#3b7af7',
            },
            mistral: {
                label: 'Mistral',
                color: '#6194fa',
            },
        },
        xAxisKey: 'month',
        dataKeys: ['usage'],
        info: 'K',
    };
};

const chartConsumptionInitialData = [
    {
        headings: { title: 'Storage Consumption', subTitle: '', icon: <HardDrive /> },
        data: [{ month: '', consumption: 0 }],
        stats: { value: '0GB', statsSubHeading: 'Monthly storage for workspace' },
        config: {
            consumption: {
                label: 'Storage Consumption',
                color: '#316fed',
            },
        },
        styles: { width: 420, height: 311 },
        dataKey: 'consumption',
        needYAxisFormatter: false,
        maxYValue: 90,
        type: OverallUsageType.STORAGE,
        info: 'GB',
    },
    {
        headings: { title: 'Credit Usage', subTitle: '', icon: <Coins /> },
        data: [{ month: '', consumption: 0 }],
        stats: { value: '0K', statsSubHeading: 'Monthly credits for workspace' },
        config: {
            consumption: {
                label: 'Usage',
                color: '#316fed',
            },
        },
        styles: { width: 420, height: 311 },
        dataKey: 'consumption',
        needYAxisFormatter: true,
        maxYValue: 16000,
        type: OverallUsageType.CREDITS,
        info: 'K',
    },
    {
        headings: { title: 'Token Usage', subTitle: '', icon: <Coins /> },
        data: [{ month: '', consumption: 0 }],
        stats: { value: '0K', statsSubHeading: 'Monthly tokens for workspace' },
        config: {
            consumption: {
                label: 'Usage',
                color: '#316fed',
            },
        },
        styles: { width: 420, height: 311 },
        dataKey: 'consumption',
        needYAxisFormatter: true,
        maxYValue: 10000,
        type: OverallUsageType.TOKENS,
        info: 'K',
    },
];

const usageInitialData = [
    {
        title: (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-gray-100">Overall</span> | Storage Used{' '}
                {new Date().toLocaleString('en-US', { month: 'long' })}
            </p>
        ),
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">0/0GB</p>,
        description: `GBs Used Last Month`,
        trendValue: '0',
        trendColor: 'text-red-500',
        Icon: HardDrive,
        TrendIcon: TrendingDownIcon,
        width: 320,
        type: OverallUsageType.STORAGE,
    },
    {
        title: (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-gray-100">Overall</span> | Credit Used{' '}
                {new Date().toLocaleString('en-US', { month: 'long' })}
            </p>
        ),
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">0/0K</p>,
        description: `Credits Used Last Month`,
        trendValue: '0',
        trendColor: 'text-red-500',
        Icon: Coins,
        TrendIcon: TrendingDownIcon,
        width: 320,
        type: OverallUsageType.CREDITS,
    },
    {
        title: (
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="text-gray-900 dark:text-gray-100">Overall</span> | Token Used{' '}
                {new Date().toLocaleString('en-US', { month: 'long' })}
            </p>
        ),
        value: <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">0/0K</p>,
        description: `Tokens Used Last Month`,
        trendValue: '0',
        trendColor: 'text-red-500',
        Icon: Coins,
        TrendIcon: TrendingDownIcon,
        width: 320,
        type: OverallUsageType.TOKENS,
    },
];

const workflowExecutionInitialData = {
    tableData: [],
    chartConfig: {} satisfies ChartConfig,
    chartData: [],
    hasData: false,
};

export const useUsage = () => {
    const { token } = useAuth();
    const { theme } = useNextTheme();
    const [workflowExecutionFrom, setWorkflowExecutionFrom] = useState<string>();
    const [workflowExecutionTo, setWorkflowExecutionTo] = useState<string>();
    const [overallUsages, setOverallUsages] = useState<DashboardDataCardProps[]>(usageInitialData);
    const [chartConsumptionData, setChartConsumptionData] =
        useState<ConsumptionChartData[]>(chartConsumptionInitialData);
    const [monthlyCreditUsageData, setMonthlyCreditUsageData] =
        useState<MonthlyCreditUsageData>(generateCreditInitialData());
    const [monthlyTokenUsageData, setMonthlyTokenUsageData] =
        useState<MonthlyTokenUsageData>(generateTokenInitialData());
    const [workflowExecutionData, setWorkflowExecutionData] =
        useState<WorkFlowExecutionData>(workflowExecutionInitialData);

    const { isFetching } = useQuery(
        'overall-usage',
        () => fetchOverallUsage(),
        {
            enabled: !!token,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                if (data?.overall) {
                    mapOverallUsages(data.overall);
                }
                if (data?.consumption) {
                    mapConsumptions(data.consumption);
                }
                if (data?.monthlyUsage) {
                    mapMonthlyUsages(data.monthlyUsage);
                }
                if (data?.workflowExecutions) {
                    mapWorkflowExecutions(data.workflowExecutions);
                }
            },
        }
    );

    const { isFetching: isWorkflowFetching } = useQuery(
        ['workflow-execution', workflowExecutionFrom, workflowExecutionTo],
        () => mock_workflow_executions,
        {
            enabled: !!(workflowExecutionFrom && workflowExecutionTo),
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            onSuccess: data => {
                mapWorkflowExecutions(data);
            },
        }
    );

    const DashboardDataCardValue = (props: DashboardCardValueProps): React.ReactNode => (
        <p className="text-d-xs font-semibold text-gray-800 dark:text-gray-300">
            {`${
                props.type === OverallUsageType.STORAGE
                    ? usageFormatter(props.total, props.quota, props.type)
                    : `${formatToShortenedUnit(
                          props.count,
                          UnitType.DEFAULT,
                          UnitType.DEFAULT,
                          UsageUnitType.COUNT,
                          UnitPrefix.NONE
                      )}/${formatToShortenedUnit(
                          props.quota.limit,
                          props.quota.unit,
                          UnitType.DEFAULT,
                          UsageUnitType.COUNT
                      )}`
            }`}
        </p>
    );

    const DashboardDataCardTitle = ({ title }: { title: string }): React.ReactNode => (
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
            <span className="text-gray-900 dark:text-gray-100">Overall</span> | {title} Used in{' '}
            {new Date().toLocaleString('en-US', { month: 'long' })}
        </p>
    );

    const dashboardDataCardTrendIcon = (props: DashboardDataCardTrendIconProps) => {
        const usage = props.type === OverallUsageType.STORAGE ? props.total : props.count;
        const lastMonthUsage = props.type === OverallUsageType.STORAGE ? props.lastMonthTotal : props.lastMonthCount;
        return usage <= lastMonthUsage ? TrendingDownIcon : TrendingUpIcon;
    };

    const dashboardDataCardTrendIconColor = (props: DashboardDataCardTrendIconProps) => {
        const usage = props.type === OverallUsageType.STORAGE ? props.total : props.count;
        const lastMonthUsage = props.type === OverallUsageType.STORAGE ? props.lastMonthTotal : props.lastMonthCount;
        return usage <= lastMonthUsage ? 'text-green-600' : 'text-red-500';
    };

    const showTrendIcon = (props: DashboardDataCardTrendIconProps) => {
        const convertKbToGb = (value: number) => {
            const storage = formatToShortenedUnit(
                value,
                UnitType.KILOBYTE,
                UnitType.GIGABYTE,
                UsageUnitType.SIZE,
                UnitPrefix.DEFAULT
            );
            return Number.isNaN(Number.parseFloat(storage)) ? 0 : Number.parseFloat(storage);
        };
        const usage =
            props.type === OverallUsageType.STORAGE ? convertKbToGb(props.total) : divideByThousand(props.count);
        const lastMonthUsage =
            props.type === OverallUsageType.STORAGE
                ? convertKbToGb(props.lastMonthTotal)
                : divideByThousand(props.lastMonthCount);
        if (usage === lastMonthUsage) {
            return false;
        }
        return true;
    };

    const usageFormatter = (sum: number, quota: IQuota, type: OverallUsageType) => {
        return `${formatToShortenedUnit(
            sum,
            UnitType.KILOBYTE,
            type === OverallUsageType.STORAGE ? UnitType.GIGABYTE : UnitType.DEFAULT,
            UsageUnitType.SIZE,
            UnitPrefix.NONE
        )}/${formatToShortenedUnit(quota.limit, quota.unit, UnitType.GIGABYTE, quota.unitType, UnitPrefix.OUTPUT)}`;
    };

    const getMonthAndYear = (isLastMonth: boolean) => {
        if (isLastMonth) {
            const lastMonth = moment().subtract(1, 'months');
            return {
                month: lastMonth.month() + 1,
                year: lastMonth.year(),
            };
        }
        return {
            month: moment().month() + 1,
            year: moment().year(),
        };
    };

    const manageUsage = (list: OverallUsage[], isLastMonth = false) => {
        const { month, year } = getMonthAndYear(isLastMonth);

        const count =
            list
                .filter(x => x.unitType === UsageUnitType.COUNT && x.month === month && x.year === year)
                ?.map(x => x.usage)
                ?.reduce((accumulator, currentValue) => accumulator + currentValue, 0) ?? 0;

        const sizes = list.filter(x => x.unitType === UsageUnitType.SIZE && x.month === month && x.year === year);

        let totalKB = 0;
        sizes.forEach((data: OverallUsage) => {
            const convertToKB = formatToShortenedUnit(
                data.usage,
                data.unit,
                UnitType.KILOBYTE,
                data.unitType,
                UnitPrefix.COUNT
            );
            totalKB += Number.parseFloat(convertToKB) ?? 0;
        });

        return { count, totalKB };
    };

    const updateUsageByType = (type: OverallUsageType, newUsage: DashboardDataCardProps) => {
        setOverallUsages(prevUsages =>
            prevUsages.map(item => (item.type === type ? { ...item, ...newUsage } : item))
        );
    };

    const mapOverallUsages = (data: OverallUsageResponse) => {
        const mapOverallUsageModel = (list: OverallUsage[], title: string, type: OverallUsageType, quota: IQuota) => {
            const { count, totalKB } = manageUsage(list);
            const { count: lastMonthCount, totalKB: lastMonthTotalKB } = manageUsage(list, true);

            const newUsage: DashboardDataCardProps = {
                title: <DashboardDataCardTitle title={title} />,
                value: <DashboardDataCardValue quota={quota} count={count} total={totalKB} type={type} />,
                description: `${
                    type === OverallUsageType.STORAGE ? UnitType.GIGABYTE.toString() : title
                } Used Last Month`,
                trendValue:
                    type === OverallUsageType.STORAGE
                        ? formatToShortenedUnit(
                              lastMonthTotalKB,
                              UnitType.KILOBYTE,
                              UnitType.GIGABYTE,
                              UsageUnitType.SIZE,
                              UnitPrefix.DEFAULT
                          )
                        : formatNumberToK(lastMonthCount),
                trendColor: dashboardDataCardTrendIconColor({
                    total: totalKB,
                    type,
                    count,
                    lastMonthCount: lastMonthCount,
                    lastMonthTotal: lastMonthTotalKB,
                }),
                Icon: type === OverallUsageType.STORAGE ? HardDrive : Coins,
                TrendIcon: dashboardDataCardTrendIcon({
                    total: totalKB,
                    type,
                    count,
                    lastMonthCount: lastMonthCount,
                    lastMonthTotal: lastMonthTotalKB,
                }),
                width: 320,
                type,
                info: type === OverallUsageType.STORAGE ? 'GB' : 'K',
                showTrendIcon: showTrendIcon({
                    total: totalKB,
                    type,
                    count,
                    lastMonthCount: lastMonthCount,
                    lastMonthTotal: lastMonthTotalKB,
                }),
            };
            updateUsageByType(type, newUsage);
        };

        if (data?.quota?.storage) {
            mapOverallUsageModel(
                data?.usage?.filter(x => x.type === OverallUsageType.STORAGE),
                'Storage',
                OverallUsageType.STORAGE,
                data?.quota?.storage
            );
        }

        if (data?.quota?.credits) {
            mapOverallUsageModel(
                data?.usage?.filter(x => x.type === OverallUsageType.CREDITS),
                'Credits',
                OverallUsageType.CREDITS,
                data?.quota?.credits
            );
        }

        if (data?.quota?.tokens) {
            mapOverallUsageModel(
                data?.usage?.filter(x => x.type === OverallUsageType.TOKENS),
                'Tokens',
                OverallUsageType.TOKENS,
                data?.quota?.tokens
            );
        }
    };

    const mapConsumptionObject = (
        sum: number,
        title: string,
        type: OverallUsageType,
        value: string,
        description: string
    ) => {
        return {
            headings: {
                title,
                subTitle: '',
                icon: <HardDrive />,
            },
            data: [{ month: '', consumption: Number.parseFloat(roundedDecimalPlaces(sum)) }],
            stats: { value, statsSubHeading: `Monthly ${type} usage for workspace` },
            config: {
                consumption: {
                    label: description,
                    color: '#316fed',
                },
            },
            styles: { width: 420, height: 311 },
            dataKey: 'consumption',
            needYAxisFormatter: false,
            maxYValue: generateNearestChartTopValue(sum, type),
            type,
        } as ConsumptionChartData;
    };

    const mapConsumptionStorages = (list: OverallUsage[], type: OverallUsageType) => {
        let storageSum = 0;

        list.forEach(item => {
            const total = formatToShortenedUnit(
                item.usage,
                item.unit,
                UnitType.GIGABYTE,
                item.unitType,
                UnitPrefix.COUNT
            );
            if (Number.parseFloat(total)) {
                storageSum += Number.parseFloat(total);
            }
        });

        return mapConsumptionObject(
            storageSum,
            'Storage Consumption',
            type,
            `${roundedDecimalPlaces(storageSum)}GB`,
            'Storage Consumption'
        );
    };

    const mapConsumptionOther = (list: OverallUsage[], type: OverallUsageType) => {
        let storageSum = 0;

        list.forEach(item => {
            const total = formatToShortenedUnit(item.usage, item.unit, UnitType.DEFAULT, UsageUnitType.COUNT);
            if (Number.parseFloat(total)) {
                storageSum += Number.parseFloat(total);
            }
        });

        return mapConsumptionObject(
            storageSum,
            type === OverallUsageType.CREDITS ? 'Credit Usage' : 'Token Usage',
            type,
            `${roundedDecimalPlaces(storageSum)}K`,
            'Usage'
        );
    };

    const mapConsumptions = (data: IConsumption) => {
        const { month, year } = getMonthAndYear(false);

        if (data?.storage) {
            const result = mapConsumptionStorages(
                data?.storage?.filter(x => x.month === month && x.year === year),
                OverallUsageType.STORAGE
            );
            if (result) {
                setChartConsumptionData(prevChartConsumptionData =>
                    prevChartConsumptionData.map(item =>
                        item.type === OverallUsageType.STORAGE ? { ...item, ...result } : item
                    )
                );
            }
        }

        if (data?.credits) {
            const result = mapConsumptionOther(
                data?.credits?.filter(x => x.month === month && x.year === year),
                OverallUsageType.CREDITS
            );
            if (result) {
                setChartConsumptionData(prevChartConsumptionData =>
                    prevChartConsumptionData.map(item =>
                        item.type === OverallUsageType.CREDITS ? { ...item, ...result } : item
                    )
                );
            }
        }

        if (data?.tokens) {
            const result = mapConsumptionOther(
                data?.tokens?.filter(x => x.month === month && x.year === year),
                OverallUsageType.TOKENS
            );
            if (result) {
                setChartConsumptionData(prevChartConsumptionData =>
                    prevChartConsumptionData.map(item =>
                        item.type === OverallUsageType.TOKENS ? { ...item, ...result } : item
                    )
                );
            }
        }
    };

    const buildMonthTokenObject = (
        monthItems: OverallUsage[],
        uniqueModels: string[]
    ): TokenUsageData => {
        const obj: TokenUsageData = { month: convertToFullMonth(monthItems[0].month) };
        const models = monthItems.map(x => x.model);

        monthItems.forEach(item => {
            const usage = divideByThousand(item.usage);
            const model = `{"${convertToSnakeCase(item.model as string)}" : ${usage}}`;
            Object.assign(obj, JSON.parse(model));
        });

        if (models.length > 0) {
            const otherModels = uniqueModels.filter(x => !models.includes(x));
            otherModels.forEach(model => {
                Object.assign(obj, JSON.parse(`{"${convertToSnakeCase(model)}" : 0}`));
            });
        }

        return obj;
    };

    const fillTokenMonthGaps = (
        list: TokenUsageData[],
        monthlyStart: moment.Moment,
        monthsDiff: number,
        emptyTokenTemplates: string[]
    ): TokenUsageData[] => {
        const response: TokenUsageData[] = [];
        for (let i = 0; i <= monthsDiff; i++) {
            const month = monthlyStart.clone().add(i, 'months').format('MMMM');
            const existing = list.find(x => x.month === month);
            if (existing) {
                response.push(existing);
            } else {
                const obj: TokenUsageData = { month };
                emptyTokenTemplates.forEach(token => Object.assign(obj, JSON.parse(token)));
                response.push(obj);
            }
        }
        return response;
    };

    const groupMonthlyToken = (arr: OverallUsage[]) => {
        const monthlyStart = moment().add(1, 'month').subtract(1, 'years');
        const monthlyEnd = moment();
        const monthsDiff = monthlyEnd.diff(monthlyStart, 'months');

        const tokens = arr.map(x => x.model).filter((model): model is string => model !== undefined);
        const uniqueModels = [...new Set(tokens)];
        const emptyTokenTemplates = uniqueModels.map(x => `{"${convertToSnakeCase(x)}" : 0}`);

        const data = groupByMonthAndYear(arr);
        const list = Object.keys(data).map(key => buildMonthTokenObject(data[key], uniqueModels));

        return fillTokenMonthGaps(list, monthlyStart, monthsDiff, emptyTokenTemplates);
    };

    const groupCreditToken = (arr: OverallUsage[]) => {
        const list: CreditUsageData[] = [];
        const monthlyStart = moment().add(1, 'month').subtract(1, 'years');
        const monthlyEnd = moment();

        const monthsDiff = monthlyEnd.diff(monthlyStart, 'months');

        for (let i = 0; i <= monthsDiff; i++) {
            const month = Number.parseInt(monthlyStart.clone().add(i, 'months').format('M'));
            const data = arr.find(x => x.month === month);
            if (data) {
                list.push({
                    month: convertToFullMonth(data.month),
                    usage: divideByThousand(data.usage),
                });
            } else {
                list.push({ month: convertToFullMonth(month), usage: 0 });
            }
        }

        return list;
    };

    const monthlyTokenConfig = (arr: OverallUsage[]) => {
        const obj = {};
        const data = arr.map(x => x.model).filter((model): model is string => model !== undefined);
        const uniqueArr = [...new Set(data)];

        const getExistingValues = (): string[] => {
            if (Object.keys(obj).length === 0) {
                return [];
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return Object.values(obj).map((item: any) => item.color);
        };

        for (let i = 0; i < uniqueArr?.length; i++) {
            const color = generateRandomThemeBasedHexColor(theme === 'dark', getExistingValues());
            const config = `{"${convertToSnakeCase(uniqueArr[i])}": {"label": "${uniqueArr[i]}", "color": "${color}"}}`;
            Object.assign(obj, JSON.parse(config));
        }
        return obj;
    };

    const mapMonthlyUsages = (data: IConsumption) => {
        if (data?.credits && data?.credits?.length > 0) {
            setMonthlyCreditUsageData({
                data: groupCreditToken(data.credits),
                config: {
                    usage: {
                        label: 'Usage',
                        color: '#3b7af7',
                    },
                },
                xAxisKey: 'month',
                info: 'K',
            });
        }
        if (data?.tokens && data?.tokens?.length > 0) {
            const filteredData = data.tokens.filter(x => x.model);
            setMonthlyTokenUsageData({
                data: groupMonthlyToken(filteredData),
                config: monthlyTokenConfig(filteredData),
                xAxisKey: 'month',
                info: 'K',
            });
        }
    };

    const mapWorkflowExecutions = (arr: IWorkflowExecution[]) => {
        const hasData =
            arr.map(x => x.executionCount).reduce((accumulator, currentValue) => accumulator + currentValue, 0) > 0;

        const aggregatedCounts = arr.reduce(
            (workflowCounts, currentWorkflowData) => {
                const { workflowName, executionCount } = currentWorkflowData;

                if (!workflowCounts[workflowName]) {
                    workflowCounts[workflowName] = 0;
                }

                workflowCounts[workflowName] += executionCount;
                return workflowCounts;
            },
            {} as { [key: string]: number }
        );

        const tableData = Object.entries(aggregatedCounts)
            .map(([workflow, execution_count]) => ({
                workflow,
                execution_count: execution_count,
                bgColor: generateRandomHexColor(),
            }))
            .sort((a, b) => b.execution_count - a.execution_count);

        const chartData = tableData.map(x => ({
            workflow: x.workflow,
            count: x.execution_count,
            fill: x.bgColor,
        }));

        const chartConfig = chartData.reduce(
            (workflowObj: { [key: string]: { label: string; color: string } }, item) => {
                workflowObj[item.workflow] = { label: item.workflow, color: item.fill };
                return workflowObj;
            },
            {}
        );
        setWorkflowExecutionData({ chartConfig, chartData, tableData, hasData });
    };

    const onWorkflowExecutionMonthChange = (month: IMonth) => {
        const currentMonthYear = moment().format('YYYY-MM');
        const fromDate = moment(`${month.month}-1`).format('YYYY-MM-DDTHH:mm:ss.sss');
        let toDate = moment(`${month.month}-1`).endOf('month').format('YYYY-MM-DDTHH:mm:ss.sss');
        if (moment(fromDate).format('YYYY-MM') === currentMonthYear) {
            toDate = moment().format('YYYY-MM-DDTHH:mm:ss.sss');
        }

        setWorkflowExecutionFrom(fromDate);
        setWorkflowExecutionTo(toDate);
    };

    return {
        isFetching,
        overallUsages,
        chartConsumptionData,
        monthlyCreditUsageData,
        monthlyTokenUsageData,
        mapOverallUsages,
        workflowExecutionData,
        isWorkflowFetching,
        onWorkflowExecutionMonthChange,
    };
};
