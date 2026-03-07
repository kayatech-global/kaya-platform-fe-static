import { Variable } from '@/hooks/use-condition-completion';

export class ConditionValidator {
    private readonly variables: Map<string, Variable>;
    private readonly validOperators = ['>=', '<=', '>', '<', '==', '!='];
    private readonly validLogicalOperators = ['AND', 'OR'];

    constructor(variables: Variable[]) {
        this.variables = new Map(variables.map(v => [`${v.tools?.name ? v.tools?.name + '_' : ''}${v.name}`, v]));
    }

    validateSyntax(condition: string): { errors: string[]; warnings: string[] } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // purpose : check for incorrect logical operators (||, &&)
        const incorrectOperators = condition.match(/(\|\||&&)/g);
        if (incorrectOperators) {
            incorrectOperators.forEach(op => {
                const suggestion = op === '&&' ? 'AND' : 'OR';
                errors.push(`Invalid logical operator '${op}'. Please use '${suggestion}' instead.`);
            });
        }

        const expressions = this.processMultilineCondition(condition);

        let lineNumber = 0;
        for (const expression of expressions) {
            const expr = expression.trim();

            if (this.validLogicalOperators.includes(expr)) {
                continue;
            }

            lineNumber++;
            this.validateExpression(expr, lineNumber, errors);
        }

        return { errors, warnings };
    }

    private parseExpression(cleanExpr: string): { toolPrefix?: string; variableName: string; operator: string; rawValue: string } | null {
        const opChars = new Set(['=', '!', '<', '>']);
        let opStart = -1;
        for (let i = 0; i < cleanExpr.length; i++) {
            if (opChars.has(cleanExpr[i])) {
                opStart = i;
                break;
            }
        }
        if (opStart === -1) return null;

        let opEnd = opStart;
        while (opEnd < cleanExpr.length && opChars.has(cleanExpr[opEnd])) opEnd++;
        const operator = cleanExpr.slice(opStart, opEnd);

        const leftPart = cleanExpr.slice(0, opStart).trim();
        const rawValue = cleanExpr.slice(opEnd).trim();

        if (!leftPart) return null;

        const dotIndex = leftPart.indexOf('.');
        let toolPrefix: string | undefined;
        let variableName: string;
        if (dotIndex !== -1 && dotIndex > 0 && dotIndex < leftPart.length - 1) {
            toolPrefix = leftPart.slice(0, dotIndex);
            variableName = leftPart.slice(dotIndex + 1);
        } else {
            variableName = leftPart;
        }

        const isWord = (s: string) => {
            for (let i = 0; i < s.length; i++) {
                const c = s.codePointAt(i) ?? 0;
                if (!((c >= 48 && c <= 57) || (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95)) return false;
            }
            return s.length > 0;
        };
        if (!isWord(variableName)) return null;
        if (toolPrefix !== undefined && !isWord(toolPrefix)) return null;

        return { toolPrefix, variableName, operator, rawValue };
    }

    private validateExpression(expr: string, lineNumber: number, errors: string[]) {
        // purpose: check if it's a logical expression (AND/OR at start)
        const isLogical = expr.startsWith('AND ') || expr.startsWith('OR ');
        const cleanExpr = isLogical ? expr.substring(expr.indexOf(' ') + 1) : expr;

        const parsed = this.parseExpression(cleanExpr);
        if (!parsed) {
            errors.push(`Line ${lineNumber}: Invalid expression format. Expected 'tool.variable operator value'`);
            return;
        }

        const { toolPrefix, variableName, operator, rawValue } = parsed;
        const toolName = toolPrefix ?? 'variable';

        if (!this.validOperators.includes(operator)) {
            errors.push(
                `Line ${lineNumber}: Invalid operator '${operator}'. Valid operators are ${this.validOperators.join(
                    ', '
                )}`
            );
        }

        if (!rawValue || rawValue.trim() === '') {
            errors.push(
                `Line ${lineNumber}: Missing value for '${
                    toolName ? toolName + '.' : ''
                }${variableName}' after operator '${operator}'`
            );
            return;
        }

        // purpose: validate variable exists and belongs to the specified tool
        if (variableName) {
            this.findAndValidateVariable(variableName, toolName, operator, rawValue, lineNumber, errors);
        }
    }

    private findAndValidateVariable(
        variableName: string,
        toolName: string,
        operator: string,
        rawValue: string,
        lineNumber: number,
        errors: string[]
    ) {
        let variableFound = false;

        // purpose: find if any variable matches both name and tool
        for (const [, variable] of this.variables) {
            if (variable.name === variableName && variable.tools?.name === toolName) {
                variableFound = true;
                this.checkVariableTypeAndValue(variable, operator, rawValue, lineNumber, errors);
                break;
            }
        }

        if (!variableFound) {
            errors.push(`Line ${lineNumber}: Variable '${variableName}' is not defined for tool '${toolName}'`);
        }
    }

    private checkVariableTypeAndValue(
        variable: Variable,
        operator: string,
        rawValue: string,
        lineNumber: number,
        errors: string[]
    ) {
        const value = rawValue.trim();
        const type = variable.type?.toString().toLowerCase();

        if (type === 'float') {
            const floatRegex = /^-?\d+\.\d+$/;
            if (!floatRegex.test(value)) {
                errors.push(
                    `Line ${lineNumber}: Value '${value}' is not a valid float. Expected a decimal (e.g., 3.14).`
                );
            }
        }

        if (type === 'string' && ['>', '<', '>=', '<='].includes(operator)) {
            errors.push(
                `Line ${lineNumber}: Operator '${operator}' is not valid for string type variable '${variable.name}'.`
            );
        }

        this.validateValue(variable, value, lineNumber, errors);
    }

    private processMultilineCondition(condition: string): string[] {
        const lines = condition.split('\n');
        const expressions: string[] = [];
        let currentExpr = '';
        let bracketCount = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            // purpose: count brackets to handle multiline arrays/objects
            // S6535: Unnecessary escape character \. Removed from \[
            bracketCount += (trimmedLine.match(/[[{]/g) ?? []).length;
            bracketCount -= (trimmedLine.match(/[\]}]/g) ?? []).length;

            currentExpr += trimmedLine;

            if (bracketCount === 0) {
                this.splitAndPushExpressions(currentExpr, expressions);
                currentExpr = '';
            } else {
                currentExpr += ' ';
            }
        }

        if (currentExpr.trim()) {
            expressions.push(currentExpr.trim());
        }

        return expressions.filter(expr => expr.trim().length > 0);
    }

    private splitAndPushExpressions(currentExpr: string, expressions: string[]) {
        // Split by AND/OR but preserve the logical operators
        const parts = currentExpr.split(/\b(AND|OR)\b/);

        if (parts.length > 1) {
            expressions.push(parts[0].trim());

            for (let j = 1; j < parts.length; j += 2) {
                if (j + 1 < parts.length) {
                    // S7778: Do not call Array#push multiple times
                    expressions.push(parts[j].trim(), parts[j + 1].trim());
                } else {
                    expressions.push(parts[j].trim());
                }
            }
        } else if (currentExpr.trim()) {
            expressions.push(currentExpr.trim());
        }
    }

    private validateValue(variable: Variable, value: string, lineNumber: number, errors: string[]) {
        const { name, type } = variable;
        const lowerType = type?.toString().toLowerCase();

        try {
            switch (lowerType) {
                case 'int':
                    this.validateInteger(name, value, lineNumber, errors);
                    break;
                case 'float':
                    this.validateFloat(name, value, lineNumber, errors);
                    break;
                case 'boolean':
                case 'bool':
                    this.validateBoolean(name, value, lineNumber, errors);
                    break;
                case 'string':
                    this.validateString(name, value, lineNumber, errors);
                    break;
                case 'list':
                    this.validateList(name, value, lineNumber, errors);
                    break;
                case 'dict':
                    this.validateDict(name, value, lineNumber, errors);
                    break;
                default:
                    errors.push(`Line ${lineNumber}: Unsupported type '${type}' for variable '${name}'`);
            }
        } catch {
            errors.push(`Line ${lineNumber}: Invalid value for '${name}': ${value}`);
        }
    }

    private validateInteger(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!/^-?\d+$/.test(value)) {
            errors.push(`Line ${lineNumber}: Expected integer for '${name}', got '${value}'`);
        }
    }

    private validateFloat(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!/^-?\d+(\.\d+)?$/.test(value)) {
            errors.push(`Line ${lineNumber}: Expected float for '${name}', got '${value}'`);
        }
    }

    private validateBoolean(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!['true', 'false'].includes(value.toLowerCase())) {
            errors.push(`Line ${lineNumber}: Expected boolean (true/false) for '${name}', got '${value}'`);
        }
    }

    private validateString(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!/^['"].*['"]$/.test(value)) {
            errors.push(`Line ${lineNumber}: String value for '${name}' must be wrapped in quotes, got '${value}'`);
        }
    }

    private validateList(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!value.startsWith('[') || !value.endsWith(']')) {
            errors.push(`Line ${lineNumber}: Array value for '${name}' must be wrapped in [], got '${value}'`);
            return;
        }
        try {
            // S7781: Prefer String#replaceAll
            const parsed = JSON.parse(value.replaceAll("'", '"'));
            if (!Array.isArray(parsed)) {
                errors.push(`Line ${lineNumber}: Expected array for '${name}', got ${typeof parsed}`);
            }
        } catch {
            errors.push(`Line ${lineNumber}: Invalid array format for '${name}', got '${value}'`);
        }
    }

    private validateDict(name: string, value: string, lineNumber: number, errors: string[]) {
        if (!value.startsWith('{') || !value.endsWith('}')) {
            errors.push(`Line ${lineNumber}: Object value for '${name}' must be wrapped in {}, got '${value}'`);
            return;
        }
        try {
            // S7781: Prefer String#replaceAll
            const parsed = JSON.parse(value.replaceAll("'", '"'));
            if (typeof parsed !== 'object' || Array.isArray(parsed)) {
                errors.push(
                    `Line ${lineNumber}: Expected object for '${name}', got ${
                        Array.isArray(parsed) ? 'array' : typeof parsed
                    }`
                );
            }
        } catch {
            errors.push(`Line ${lineNumber}: Invalid object format for '${name}', got '${value}'`);
        }
    }
}
