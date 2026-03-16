import React from 'react';
import { Button } from '@/components';
import { DetailItemInput, valuesProps } from '@/components/molecules/detail-item-input/detail-item-input';
import { cn } from '@/lib/utils';
import { GuardrailBindingLevelType } from '@/enums';
import { AgentType } from '@/components/organisms';
import { IGuardrailBinding } from '@/models';

interface GuardrailSelectorTriggerProps {
    level: GuardrailBindingLevelType;
    label?: string;
    labelClassName?: string;
    description?: string;
    agent?: AgentType;
    guardrails?: string[];
    guardrailBinding?: IGuardrailBinding[];
    guardrailsList: valuesProps[] | undefined;
    onOpen: (open: boolean) => void;
    onGetBinding: () => void;
    onChange: () => void;
    onRemove: () => void;
}

export const GuardrailSelectorTrigger: React.FC<GuardrailSelectorTriggerProps> = ({
    level,
    label,
    labelClassName,
    description,
    agent,
    guardrails,
    guardrailBinding,
    guardrailsList,
    onOpen,
    onGetBinding,
    onChange,
    onRemove,
}) => {
    if (level !== GuardrailBindingLevelType.AGENT) {
        return null;
    }

    const hasGuardrails =
        (guardrails && guardrails.length > 0 && !agent?.isReusableAgentSelected) ||
        (guardrailsList && guardrailsList.length > 0);

    const hasBindingOrGuardrails = guardrails && guardrails.length > 0;
    const hasAgent = !!agent;

    const renderFooter = () => {
        if (hasGuardrails) {
            return (
                <div className="w-full flex justify-start items-center gap-x-3">
                    <Button variant="link" className="text-blue-400" onClick={onChange}>
                        Change
                    </Button>
                    <Button variant="link" className="text-red-500 hover:text-red-400" onClick={onRemove}>
                        Remove All
                    </Button>
                </div>
            );
        }

        if (!hasBindingOrGuardrails && !hasAgent) {
            return (
                <div
                    className={cn('flex justify-start items-center', {
                        'w-full': guardrailBinding && guardrailBinding.length > 0,
                    })}
                >
                    <Button
                        variant="link"
                        onClick={() => {
                            onGetBinding();
                            onOpen(true);
                        }}
                    >
                        Add Guardrails
                    </Button>
                </div>
            );
        }
        return null;
    };

    return (
        <DetailItemInput
            label={label ?? 'Guardrails'}
            labelClassName={labelClassName}
            values={guardrailsList}
            imagePath="/png/guardrails.png"
            imageType="png"
            description={
                description ??
                'Select guardrail for this agent for responsible behavior and secure handling of sensitive data.'
            }
            footer={renderFooter()}
        />
    );
};
