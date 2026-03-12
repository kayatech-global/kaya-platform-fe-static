import { redirect } from 'next/navigation';

interface WorkspacePageProps {
    params: Promise<{ wid: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
    const { wid } = await params;
    // Redirect to workspace overview as the default landing page
    redirect(`/workspace/${wid}/overview`);
}
