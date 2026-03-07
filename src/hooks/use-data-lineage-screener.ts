import { useEffect, useMemo, useState } from 'react';
import { IDataLineageScreenerProps } from '@/app/workspace/[wid]/data-lineage/components/data-lineage-screener';
import { SessionViewType } from '@/enums';
import { IDataLineageViewStep, IDataLineageVisualGraph } from '@/models';
import { isNullOrEmpty } from '@/lib/utils';
import moment from 'moment';

type TabItem = {
    value: SessionViewType | string;
    label: string;
    content?: IDataLineageVisualGraph;
    steps?: IDataLineageViewStep[];
    isCustom?: boolean;
};

const INITIAL_TABS: TabItem[] = [
    {
        value: SessionViewType.LINEAR,
        label: 'Linear View',
        content: undefined,
        steps: undefined,
    },
    {
        value: SessionViewType.MODULAR,
        label: 'Modular View',
        content: undefined,
        steps: undefined,
    },
];

export const useDataLineageScreener = (props: IDataLineageScreenerProps) => {
    const { isOpen, modular, linear, loadingView, selectedExecution } = props;
    const [tabs, setTabs] = useState<TabItem[]>(INITIAL_TABS);
    const [activeTab, setActiveTab] = useState<SessionViewType | string>(SessionViewType.LINEAR);
    const [oldTab, setOldTab] = useState<SessionViewType | string>(SessionViewType.LINEAR);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        if ((modular || linear) && !loadingView) {
            setTabs(prevTabs => [
                {
                    ...prevTabs[0],
                    content: linear,
                    steps: [],
                },
                {
                    ...prevTabs[1],
                    content: modular?.visualGraph,
                    steps: modular?.steps,
                },
            ]);
            setActiveTab(SessionViewType.LINEAR);
            setMounted(true);
        }
    }, [isOpen, modular, linear, loadingView]);

    const screenerTitle = useMemo(() => {
        if (selectedExecution) {
            return `${selectedExecution.workflowName}${
                isNullOrEmpty(selectedExecution.startedAt)
                    ? ''
                    : `: ${moment.utc(selectedExecution.startedAt).local().format('HH:mm:ss')}`
            }${
                isNullOrEmpty(selectedExecution.endedAt)
                    ? ''
                    : `-${moment.utc(selectedExecution.endedAt).local().format('HH:mm:ss')}`
            }`.trimEnd();
        }
        return '-';
    }, [selectedExecution]);

    const handleAddTab = (tabName: string, content: IDataLineageVisualGraph | undefined) => {
        const newTab: TabItem = {
            value: `detail-${tabs.length + 1}`,
            label: tabName,
            content: content,
            isCustom: true,
        };
        setTabs(prev => [...prev, newTab]);
        setOldTab(activeTab);
        setActiveTab(newTab.value);
    };

    const handleCloseTab = (value: string) => {
        setTabs(prev => {
            const filtered = prev.filter(tab => tab.value !== value);
            // If the closed tab was active, set active to the first tab
            if (activeTab === value && filtered.length > 0) {
                if (oldTab) {
                    setActiveTab(oldTab);
                } else {
                    setActiveTab(filtered[0].value);
                }
            }
            return filtered;
        });
    };

    return {
        tabs,
        activeTab,
        mounted,
        screenerTitle,
        setTabs,
        setActiveTab,
        handleAddTab,
        handleCloseTab,
    };
};
