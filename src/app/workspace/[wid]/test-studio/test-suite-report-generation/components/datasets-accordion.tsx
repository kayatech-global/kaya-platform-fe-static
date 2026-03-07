'use client';
import { ITestExecutionInputReport, TestStatus } from '../../data-generation';
import { TrendingUp, FileText, Check, Target, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/atoms/accordion';
import { cn } from '@/lib/utils';

const MOCK_INPUT_PAYLOAD = `{
  "cardNumber": "4111111111111111",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "amount": 99.99
}`;

const MOCK_EXPECTED_OUTPUT = 'User Created event emitted and email queued';
const MOCK_ACTUAL_OUTPUT = 'User Created event emitted and email queued';
const MOCK_GROUND_TRUTH_EXPECTED = `{"riskLevel": "low", "approved": true}`;

type DatasetsAccordionProps = {
    report: ITestExecutionInputReport;
};

export const DatasetsAccordion = ({ report }: DatasetsAccordionProps) => {
    return (
        <div className="w-full space-y-3">
            <Accordion type="single" collapsible className="w-full space-y-3">
                {/* INPUT Section */}
                <AccordionItem value="input" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <FileText size={15} className="text-blue-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Input</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4" forceMount>
                        <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 overflow-x-auto">
                            {MOCK_INPUT_PAYLOAD}
                        </pre>
                    </AccordionContent>
                </AccordionItem>

                {/* OUTPUT Section */}
                <AccordionItem value="output" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={15} className="text-blue-600" />
                                <span className="text-xs font-semibold text-gray-600 uppercase">Output</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400 uppercase">Score</span>
                                    <span
                                        className={cn(
                                            'px-2 py-0.5 rounded text-[10px] font-semibold',
                                            (() => {
                                                const score = report.score ?? 0;
                                                if (score >= 80) return 'bg-green-100 text-green-700';
                                                if (score >= 50) return 'bg-amber-100 text-amber-600';
                                                return 'bg-red-100 text-red-600';
                                            })()
                                        )}
                                    >
                                        {report.score ?? 0}
                                    </span>
                                </div>
                                <div
                                    className={cn(
                                        'flex items-center gap-1 px-2 py-0.5 rounded',
                                        report.status === TestStatus.Passed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                    )}
                                >
                                    {report.status === TestStatus.Passed ? <Check size={10} /> : <X size={10} />}
                                    <span className="text-[10px] font-semibold">
                                        {report.status === TestStatus.Passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4" forceMount>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Expected</p>
                                <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 overflow-x-auto">
                                    {MOCK_EXPECTED_OUTPUT}
                                </pre>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Actual</p>
                                <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 overflow-x-auto">
                                    {MOCK_ACTUAL_OUTPUT}
                                </pre>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* GROUND TRUTH Section */}
                <AccordionItem value="ground-truth" className="border border-gray-200 rounded-lg bg-white">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                            <Target size={15} className="text-blue-600" />
                            <span className="text-xs font-semibold text-gray-600 uppercase">Expected Behavior</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4" forceMount>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-md">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Expected</p>
                                <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 overflow-x-auto">
                                    {MOCK_GROUND_TRUTH_EXPECTED}
                                </pre>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-2">Actual</p>
                                <pre className="bg-white rounded p-3 text-xs text-gray-700 border border-gray-200 overflow-x-auto">
                                    {report.groundTruth}
                                </pre>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};
