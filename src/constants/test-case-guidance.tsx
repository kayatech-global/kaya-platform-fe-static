import React from 'react';
import { TestCaseMethod } from '@/enums/test-studio-type';

export interface TestCaseGuidance {
    message: React.ReactNode;
    details: React.ReactNode;
}

export const TEST_CASE_GUIDANCE: Record<TestCaseMethod, TestCaseGuidance> = {
    [TestCaseMethod.Manual]: {
        message: (
            <span>
                Define each test case individually by specifying{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">Inputs</span> and{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">Expected Outputs</span>.
            </span>
        ),
        details: (
            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-800">
                    This method allows you to craft specific test scenarios one by one. It&apos;s best for precise,
                    targeted testing.
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-800">
                    <li>
                        Define the <span className="font-semibold text-indigo-600 dark:text-indigo-400">Input</span>{' '}
                        required for your scenario. These are the input messages and parameters your workflow needs.
                    </li>
                    <li>
                        If your workflow uses dynamic variables (like user names or dates), click{' '}
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                            &quot;Configure Variables&quot;
                        </span>{' '}
                        to set them.
                    </li>
                    <li>
                        Specify the{' '}
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Expected Output</span>. This
                        is what you expect the workflow to produce. You can also define{' '}
                        <span className="font-semibold text-gray-600 dark:text-gray-400">the Expected Behaviour</span>{' '}
                        at the test case.
                    </li>
                    <li>
                        Need more cases? Click{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">&quot;Add Test Cases&quot;</span>{' '}
                        at the top to continue adding as many as you need.
                    </li>
                </ol>
            </div>
        ),
    },
    [TestCaseMethod.Auto]: {
        message: (
            <span>
                Define the{' '}
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                    Scenario, Sample and Instructions
                </span>
                {', for the AI to generate test cases.'}
            </span>
        ),
        details: (
            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-800">
                    Let AI do the heavy lifting! Describe what you want to test, and the system will create diverse test
                    cases automatically.
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-800">
                    <li>
                        First, define <span className="font-semibold text-blue-600 dark:text-blue-400">How many</span>{' '}
                        test cases you need by entering the{' '}
                        <span className="font-semibold">&quot;No of Inputs&quot;</span>{'.'}
                    </li>
                    <li>
                        Describe the{' '}
                        <span className="font-semibold text-purple-600 dark:text-purple-400">Scenario</span>. For
                        example: <em>&quot;Testing customer support responses for refund requests.&quot;</em>
                    </li>
                    <li>
                        Give specific{' '}
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Instructions</span>. For
                        example:{' '}
                        <em>
                            &quot;Generate angry customer emails mentioning various product defects.&quot;
                        </em>
                    </li>
                    <li>
                        The system will check a sample to ensure it&apos;s on the right track. Review the sample{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">Input</span> and{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">Output</span> formats.
                    </li>
                </ol>
            </div>
        ),
    },
    [TestCaseMethod.Upload]: {
        message: (
            <span>
                Upload an <span className="font-semibold text-green-600 dark:text-green-400">Excel file</span> with your
                test data for bulk creation.
            </span>
        ),
        details: (
            <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-800">
                    Perfect for large datasets! Use your existing spreadsheets to populate the test suite instantly.
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-800">
                    <li>
                        Prepare your{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">Excel File (.xlsx)</span>.
                    </li>
                    <li>
                        Ensure your top row (headers) contains columns for{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Input</span>,{' '}
                        <span className="font-semibold text-orange-600 dark:text-orange-400">Expected Output</span>, and
                        optionally <span className="font-semibold text-gray-600 dark:text-gray-400">Ground Truth</span>.
                    </li>
                    <li>Drag and drop your file into the upload area below, or click to browse.</li>
                    <li>
                        Once uploaded, you&apos;ll need to{' '}
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Map the Columns</span>.
                        Select which header from your file corresponds to the Input, Output, etc.
                    </li>
                </ol>
            </div>
        ),
    },
};

export function getTestCaseGuidance(method: TestCaseMethod): TestCaseGuidance {
    return TEST_CASE_GUIDANCE[method] ?? { message: '', details: null };
}
