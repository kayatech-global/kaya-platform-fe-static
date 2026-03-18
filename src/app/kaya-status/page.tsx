import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import KayaStatusSurface from './kaya-status-surface';

export const metadata: Metadata = {
    title: 'KAYA Platform Status',
    description: 'Real-time uptime and incident tracking for all KAYA platform services.',
};

const KayaStatusPage = () => {
    return (
        <div className="w-full max-w-[960px] mx-auto px-4 py-8 flex flex-col gap-6">
            {/* Page header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted border border-border shrink-0">
                    <Activity size={16} className="text-muted-foreground" />
                </div>
                <div>
                    <h1 className="text-base font-semibold text-foreground leading-tight">KAYA Platform Status</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Infrastructure &amp; service health dashboard
                    </p>
                </div>
            </div>

            {/* Status surface */}
            <KayaStatusSurface />
        </div>
    );
};

export default KayaStatusPage;
