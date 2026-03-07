import type { IDataLineageVisualGraph } from '@/models/data-lineage.model';
import {
    CustomWorkflowRenderer
} from '@/app/workspace/[wid]/test-studio/test-suite-report-generation/components/custom-workflow-renderer';

export default function WorkflowGraphView({ graph }: Readonly<{ graph: IDataLineageVisualGraph }>) {
  return (
    <div style={{ height: 350, width: '100%' }}>
      <CustomWorkflowRenderer graphData={graph} />
    </div>
  );
}
