import { Category } from '@/hooks/use-condition-completion';

export const transformCondition = (condition: string, variableServiceMap: Record<string, string>): string => {
    // purpose : split the condition into tokens (variables, operators, values, and logical operators)
    const tokens = condition.split(/(AND|OR|==|!=|>=|<=|>|<)/g);

    return tokens
        .map(token => {
            token = token.trim();

            if (['AND', 'OR', '==', '!=', '>=', '<=', '>', '<'].includes(token)) {
                return token;
            }

            if (variableServiceMap[token] && !token.includes('.')) {
                return `${variableServiceMap[token]}.${token}`;
            }

            return token;
        })
        .join(' ');
};

export const getVariableServiceMap = (completion: Category[]): Record<string, string> => {
    const variableServiceMap: Record<string, string> = {};

    for (const { tools, name } of completion) {
        if (name == 'Variables') {
            for (const tool of tools) {
                if (tool.variables) {
                    for (const variable of tool.variables) {
                        variableServiceMap[variable.name] = tool.name;
                    }
                }
            }
        }
    }

    return variableServiceMap;
};
