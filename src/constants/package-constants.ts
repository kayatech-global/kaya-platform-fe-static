import { PackageReleaseType } from '@/enums';

export const releaseTypes = [
    {
        value: PackageReleaseType.Major,
        label: 'Major Release',
        description:
            'Changes in workflow execution like changing the agent type or workflow path or removing or renaming an agent or tool or variable',
    },
    {
        value: PackageReleaseType.Minor,
        label: 'Minor Release',
        description:
            'Improvements to execution like adding a fallback agent, adding a new tool or knowledge source or improving a prompt',
    },
    {
        value: PackageReleaseType.Patch,
        label: 'Patch Release',
        description: 'Small tweaks like changing LLM temperature, changing labels, formatting, secret reference',
    },
];
