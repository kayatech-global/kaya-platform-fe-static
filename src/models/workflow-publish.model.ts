export interface IWorkflowPublish {
    draftVersion?: number;
    publishedVersion?: number;
    comment: string;
}

export interface IWorkflowPublishPayload {
    comments: string;
}
