import { ITestSuite, ITestDataSet, TestCaseMethod } from '@/app/workspace/[wid]/test-studio/data-generation';
import DataTable from '@/components/molecules/table/data-table';
import { Badge } from '@/components/atoms/badge';
import React from 'react';
import { TestCaseNumberBadge } from '@/components/atoms';
import { AgentOutputRow } from '@/components/molecules/test-case-table';
import { IVariableOption } from '@/models';
import { handleNoValue } from '@/lib/utils';

interface TestSuitTestCaseTableProps {
    selectedTest: ITestSuite;
}

export const TestSuitTestCaseTable = (props: TestSuitTestCaseTableProps) => {
    const { selectedTest } = props;

    // Edit state for parent table

    // Get inputs data
    let inputsData: ITestDataSet[] = [];
    let agentNames: string[] = [];
    let agentIds: string[] = [];

    // Agent save handler
    const handleAgentSave = (
        agentIdx: number,
        rowIdx: number,
        agentId: string,
        data: { expectedOutput: string; expectedBehaviour: string }
    ) => {
        if (!agentId || !selectedTest.agentOutputFields) return;
        if (typeof window !== 'undefined') {
            selectedTest.agentOutputFields[agentId][rowIdx] = {
                ...selectedTest.agentOutputFields[agentId][rowIdx],
                ...data,
            };
        }
    };

    // Fallback to existing logic for upload/manual
    if (Array.isArray(selectedTest.testDataSets)) {
        inputsData = selectedTest.testDataSets;
    } else if (
        selectedTest.testDataSets &&
        typeof selectedTest.testDataSets === 'object' &&
        'inputs' in selectedTest.testDataSets
    ) {
        inputsData = (selectedTest.testDataSets as { inputs?: ITestDataSet[] }).inputs ?? [];
    }
    // Get agent names and IDs from workflow graph
    const agentNodes = (selectedTest.workflowGraph?.nodes?.filter(
        (node: { type: string; data?: { name: string } }) => node.data?.name
    ) || []) as unknown as Array<{ id: string; data: { name: string } }>;
    agentNames = agentNodes.map(node => node.data.name);
    agentIds = agentNodes.map(node => node.id);

    return (
        <DataTable
            columns={[
                {
                    id: 'no',
                    header: () => <span className="text-left w-full block">No.</span>,
                    cell: ({ row }) => (
                        <TestCaseNumberBadge
                            rowIndex={row.index}
                            testMethod={selectedTest.testCaseMethod as TestCaseMethod}
                        />
                    ),
                    meta: { width: 40, align: 'text-left' },
                },
                {
                    id: 'input',
                    header: () => <span className="text-left w-full block">Input</span>,
                    cell: ({ row }) => {
                        const input = row.original.input;
                        const displayValue = typeof input === 'string' ? input : input?.message;
                        return (
                            <div className="break-words whitespace-pre-line max-w-[180px] text-left">
                                {handleNoValue(displayValue)}
                            </div>
                        );
                    },
                },
                {
                    accessorKey: 'expectedOutput',
                    header: () => <span className="text-left w-full block">Expected Output</span>,
                    cell: ({ row }) => {
                        const output= row.original.expectedOutput;
                        return (
                            <div className="break-words whitespace-pre-line max-w-[180px] text-left">
                                {handleNoValue(output)}
                            </div>
                        );
                    },
                },
                {
                    accessorKey: 'expectedBehaviour',
                    header: () => <span className="text-left w-full block">Expected Workflow Behaviour</span>,
                    cell: ({ row }) => {
                        const expectedBehaviour= row.original.expectedBehaviour;
                        return(

                            <div className="break-words whitespace-pre-line max-w-[180px] text-left">
                                {handleNoValue(expectedBehaviour)}
                            </div>
                        )
                    },
                },
                {
                    id: 'variables',
                    header: () => <span className="text-left w-full block">Variables</span>,
                    cell: ({ row }) => {
                        const input = row.original.input;
                        const variables = input.variables;
                        return (
                            <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                {variables && variables.length > 0 ? (
                                    variables.map((variable: IVariableOption, idx: number) => (
                                        <Badge
                                            key={variable.id ?? `${variable.label}-${idx}`}
                                            variant="secondary"
                                            className="px-2 py-0.5 bg-white border border-indigo-100 text-gray-600 shadow-sm gap-1.5 hover:bg-indigo-50/50"
                                        >
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-400">
                                                {variable.label}
                                            </span>
                                            <div className="h-3 w-[1px] bg-blue-100" />
                                            <span className="font-mono text-xs font-medium text-indigo-900">
                                                {String(variable.value)}
                                            </span>
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </div>
                        );
                    },
                },
            ]}
            data={inputsData}
            renderExpandedRow={
                agentNames.length > 0 && selectedTest
                    ? row => {
                          return (
                              <div className="bg-gray-50 p-0">
                                  <div className="border rounded-md overflow-hidden bg-white">
                                      {/* Header */}
                                      <div className="grid grid-cols-12 bg-gray-50 border-b text-sm font-medium">
                                          <div className="col-span-1 px-4 py-3 border-r" />
                                          <div className="col-span-3 px-4 py-3 border-r">Agent</div>
                                          <div className="col-span-3 px-4 py-3 border-r">Output</div>
                                          <div className="col-span-3 px-4 py-3 border-r">Expected Behavior</div>
                                          <div className="col-span-2 px-4 py-3">Actions</div>
                                      </div>
                                      {agentNames.map((agentName, agentIdx) => {
                                          const agentId = agentIds[agentIdx];
                                          const agentOutput =
                                              selectedTest.agentOutputFields?.[agentId]?.[row.index]?.expectedOutput ??
                                              '-';
                                          const agentGroundTruth =
                                              selectedTest.agentOutputFields?.[agentId]?.[row.index]
                                                  ?.expectedBehaviour ?? '-';

                                          return (
                                              <AgentOutputRow
                                                  key={`row-${row.index}-agent-${agentIdx}`}
                                                  agentName={agentName}
                                                  agentOutput={agentOutput}
                                                  agentGroundTruth={agentGroundTruth}
                                                  agentIdx={agentIdx}
                                                  rowIdx={row.index}
                                                  onSave={(idx, data) => handleAgentSave(idx, row.index, agentId, data)}
                                              />
                                          );
                                      })}
                                  </div>
                              </div>
                          );
                      }
                    : undefined
            }
            expandedColumnWidth={40}
            showHeader={false}
            showFooter={true}
            defaultPageSize={10}
            tableClassNames="border rounded-md overflow-hidden"
            tableBodyCellClassNames="align-left"
            manualSpan={true}
            showTableSearch={false}
            enableExpandByRowClick={true}
        />
    );
};
