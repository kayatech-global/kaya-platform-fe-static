export interface RecentActivityModel {
    recent_activity: RecentActivity[];
}

export interface RecentActivity {
    workflowName: string;
    date: string;
    tokenCount: number;
}
