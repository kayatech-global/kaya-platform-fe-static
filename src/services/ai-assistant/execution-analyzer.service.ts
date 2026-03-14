import { ExecutionInsight } from '@/models/ai-assistant.model';
import { IDataLineageSession, IDataLineageViewStep } from '@/models';
import { ExecutionStatusType } from '@/enums';

/**
 * Service to analyze workflow execution data and provide insights
 */
class ExecutionAnalyzerService {
    /**
     * Analyze execution sessions and generate insights
     */
    analyzeExecutions(
        sessions: IDataLineageSession[],
        recentSteps?: IDataLineageViewStep[]
    ): ExecutionInsight[] {
        const insights: ExecutionInsight[] = [];

        if (sessions.length === 0) {
            return insights;
        }

        // Analyze execution timing patterns
        insights.push(...this.analyzeExecutionTiming(sessions));

        // Analyze success/failure rates
        insights.push(...this.analyzeSuccessRate(sessions));

        // Analyze step-level insights if available
        if (recentSteps && recentSteps.length > 0) {
            insights.push(...this.analyzeStepPerformance(recentSteps));
        }

        // Detect potential issues
        insights.push(...this.detectPatternIssues(sessions));

        return insights;
    }

    /**
     * Analyze execution timing patterns
     */
    private analyzeExecutionTiming(sessions: IDataLineageSession[]): ExecutionInsight[] {
        const insights: ExecutionInsight[] = [];

        // Calculate execution durations
        const durations: number[] = [];
        
        for (const session of sessions) {
            if (session.startedAt && session.endedAt) {
                const start = new Date(session.startedAt).getTime();
                const end = new Date(session.endedAt).getTime();
                const duration = end - start;
                if (duration > 0) {
                    durations.push(duration);
                }
            }
        }

        if (durations.length === 0) {
            return insights;
        }

        // Calculate statistics
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        const maxDuration = Math.max(...durations);
        const minDuration = Math.min(...durations);

        // Check for high variance (indicates inconsistent performance)
        const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / avgDuration;

        if (coefficientOfVariation > 0.5 && durations.length >= 5) {
            insights.push({
                id: `timing-variance-${Date.now()}`,
                type: 'reliability',
                title: 'Inconsistent execution times',
                description: `Execution times vary significantly (CV: ${(coefficientOfVariation * 100).toFixed(0)}%). Times range from ${this.formatDuration(minDuration)} to ${this.formatDuration(maxDuration)}.`,
                impact: 'medium',
                recommendation: 'Investigate external factors causing variability, such as API latency, data size variations, or concurrent load.',
            });
        }

        // Check for slow average execution
        const avgSeconds = avgDuration / 1000;
        if (avgSeconds > 60) {
            insights.push({
                id: `timing-slow-${Date.now()}`,
                type: 'performance',
                title: 'Slow average execution time',
                description: `Average execution time is ${this.formatDuration(avgDuration)}, which may impact user experience.`,
                impact: 'high',
                recommendation: 'Consider optimizing agent prompts, reducing tool calls, or implementing parallel execution where possible.',
                metrics: {
                    current: avgSeconds,
                    potential: avgSeconds * 0.5, // Suggest 50% improvement target
                    unit: 'seconds',
                },
            });
        }

        return insights;
    }

    /**
     * Analyze success/failure rates
     */
    private analyzeSuccessRate(sessions: IDataLineageSession[]): ExecutionInsight[] {
        const insights: ExecutionInsight[] = [];

        let successCount = 0;
        let failureCount = 0;
        let pendingCount = 0;

        for (const session of sessions) {
            const status = session.status?.toUpperCase();
            if (status === ExecutionStatusType.SUCCESS || status === 'COMPLETED') {
                successCount++;
            } else if (status === ExecutionStatusType.FAILED || status === 'ERROR') {
                failureCount++;
            } else {
                pendingCount++;
            }
        }

        const totalCompleted = successCount + failureCount;
        if (totalCompleted === 0) {
            return insights;
        }

        const successRate = (successCount / totalCompleted) * 100;
        const failureRate = (failureCount / totalCompleted) * 100;

        // Alert on high failure rate
        if (failureRate > 20 && failureCount >= 3) {
            insights.push({
                id: `reliability-failures-${Date.now()}`,
                type: 'reliability',
                title: 'High failure rate detected',
                description: `${failureRate.toFixed(0)}% of executions are failing (${failureCount} out of ${totalCompleted}).`,
                impact: 'high',
                recommendation: 'Review recent failures in Data Lineage to identify common error patterns. Check agent configurations and external API availability.',
                metrics: {
                    current: failureRate,
                    potential: 5, // Target 5% or less
                    unit: '% failure rate',
                },
            });
        }

        // Commend good success rate
        if (successRate >= 95 && totalCompleted >= 10) {
            insights.push({
                id: `reliability-success-${Date.now()}`,
                type: 'reliability',
                title: 'Excellent reliability',
                description: `${successRate.toFixed(0)}% success rate across ${totalCompleted} executions.`,
                impact: 'low',
                recommendation: 'Consider documenting current configurations as a baseline for future workflows.',
            });
        }

        return insights;
    }

    /**
     * Analyze step-level performance
     */
    private analyzeStepPerformance(steps: IDataLineageViewStep[]): ExecutionInsight[] {
        const insights: ExecutionInsight[] = [];

        // Group steps by agent name
        const stepsByAgent = new Map<string, IDataLineageViewStep[]>();
        
        for (const step of steps) {
            const agentName = step.payload?.agentName || step.payload?.job || `Step ${step.stepIndex}`;
            if (!stepsByAgent.has(agentName)) {
                stepsByAgent.set(agentName, []);
            }
            stepsByAgent.get(agentName)!.push(step);
        }

        // Analyze each agent's performance
        let totalLatency = 0;
        const agentLatencies: Array<{ name: string; avgLatency: number; count: number }> = [];

        for (const [agentName, agentSteps] of stepsByAgent) {
            const latencies: number[] = [];
            
            for (const step of agentSteps) {
                const metrics = step.payload?.metrics;
                if (metrics?.latency) {
                    const latencyMs = this.parseLatency(metrics.latency);
                    if (latencyMs > 0) {
                        latencies.push(latencyMs);
                    }
                }
            }

            if (latencies.length > 0) {
                const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
                totalLatency += avgLatency * latencies.length;
                agentLatencies.push({ name: agentName, avgLatency, count: latencies.length });
            }
        }

        // Find bottleneck agents (top 25% of total latency)
        if (agentLatencies.length > 1) {
            const sorted = [...agentLatencies].sort((a, b) => b.avgLatency - a.avgLatency);
            const topAgent = sorted[0];
            
            if (topAgent && totalLatency > 0) {
                const percentage = (topAgent.avgLatency * topAgent.count / totalLatency) * 100;
                
                if (percentage > 50) {
                    insights.push({
                        id: `bottleneck-${Date.now()}`,
                        type: 'performance',
                        title: `Bottleneck detected: ${topAgent.name}`,
                        description: `Agent "${topAgent.name}" accounts for ${percentage.toFixed(0)}% of execution time (avg ${this.formatDuration(topAgent.avgLatency)}).`,
                        impact: 'high',
                        recommendation: 'Optimize this agent by simplifying the prompt, reducing tool calls, or using a faster model.',
                        metrics: {
                            current: topAgent.avgLatency / 1000,
                            potential: topAgent.avgLatency / 2000,
                            unit: 'seconds',
                        },
                    });
                }
            }
        }

        // Analyze token usage
        this.analyzeTokenUsage(steps, insights);

        return insights;
    }

    /**
     * Analyze token usage patterns
     */
    private analyzeTokenUsage(steps: IDataLineageViewStep[], insights: ExecutionInsight[]): void {
        let totalPromptTokens = 0;
        let totalResponseTokens = 0;
        let stepCount = 0;

        for (const step of steps) {
            const metrics = step.payload?.metrics;
            if (metrics) {
                if (typeof metrics.promptTokens === 'number') {
                    totalPromptTokens += metrics.promptTokens;
                }
                if (typeof metrics.responseTokens === 'number') {
                    totalResponseTokens += metrics.responseTokens;
                }
                stepCount++;
            }
        }

        if (stepCount === 0) {
            return;
        }

        const avgPromptTokens = totalPromptTokens / stepCount;
        const avgResponseTokens = totalResponseTokens / stepCount;
        const totalTokens = totalPromptTokens + totalResponseTokens;

        // Check for high prompt token usage (indicates verbose prompts)
        if (avgPromptTokens > 2000) {
            insights.push({
                id: `tokens-prompt-${Date.now()}`,
                type: 'cost',
                title: 'High prompt token usage',
                description: `Average prompt size is ${avgPromptTokens.toFixed(0)} tokens. Consider optimizing prompts.`,
                impact: 'medium',
                recommendation: 'Review prompt templates for unnecessary context or instructions. Consider using dynamic prompts that only include relevant information.',
                metrics: {
                    current: avgPromptTokens,
                    potential: 1000,
                    unit: 'tokens/step',
                },
            });
        }

        // Check for inefficient token ratio
        if (totalPromptTokens > 0 && totalResponseTokens > 0) {
            const ratio = totalPromptTokens / totalResponseTokens;
            if (ratio > 10) {
                insights.push({
                    id: `tokens-ratio-${Date.now()}`,
                    type: 'cost',
                    title: 'Inefficient prompt-to-response ratio',
                    description: `Prompts use ${ratio.toFixed(1)}x more tokens than responses. This indicates opportunity for optimization.`,
                    impact: 'medium',
                    recommendation: 'Large prompts with small outputs may indicate over-engineered instructions. Consider simplifying.',
                });
            }
        }

        // Provide total token summary
        if (totalTokens > 10000) {
            insights.push({
                id: `tokens-total-${Date.now()}`,
                type: 'cost',
                title: 'High total token usage',
                description: `This workflow uses approximately ${(totalTokens / 1000).toFixed(1)}K tokens per execution.`,
                impact: totalTokens > 50000 ? 'high' : 'medium',
                recommendation: 'Consider caching frequent queries, using embeddings for similar inputs, or batching operations.',
                metrics: {
                    current: totalTokens,
                    potential: totalTokens * 0.7,
                    unit: 'tokens',
                },
            });
        }
    }

    /**
     * Detect pattern-based issues
     */
    private detectPatternIssues(sessions: IDataLineageSession[]): ExecutionInsight[] {
        const insights: ExecutionInsight[] = [];

        // Look for repeated failures in short time windows
        const failedSessions = sessions.filter(s => 
            s.status?.toUpperCase() === ExecutionStatusType.FAILED || 
            s.status?.toUpperCase() === 'ERROR'
        );

        if (failedSessions.length >= 3) {
            // Check if failures are clustered
            const sortedFailures = [...failedSessions].sort((a, b) => 
                new Date(b.startedAt || '').getTime() - new Date(a.startedAt || '').getTime()
            );

            // Check recent failures (last 3)
            const recentFailures = sortedFailures.slice(0, 3);
            if (recentFailures.length === 3) {
                const firstTime = new Date(recentFailures[2].startedAt || '').getTime();
                const lastTime = new Date(recentFailures[0].startedAt || '').getTime();
                const timeWindow = lastTime - firstTime;

                // If 3 failures within 1 hour
                if (timeWindow < 3600000) {
                    insights.push({
                        id: `pattern-cluster-${Date.now()}`,
                        type: 'reliability',
                        title: 'Failure cluster detected',
                        description: '3 failures occurred within the last hour. This may indicate a systemic issue.',
                        impact: 'high',
                        recommendation: 'Check for external service outages, configuration changes, or resource constraints.',
                    });
                }
            }
        }

        return insights;
    }

    /**
     * Parse latency string to milliseconds
     */
    private parseLatency(latency: string | number): number {
        if (typeof latency === 'number') {
            return latency;
        }

        if (typeof latency === 'string') {
            // Handle formats like "1.5s", "500ms", "1500"
            const match = latency.match(/^([\d.]+)(ms|s)?$/i);
            if (match) {
                const value = parseFloat(match[1]);
                const unit = match[2]?.toLowerCase();
                if (unit === 's') {
                    return value * 1000;
                } else if (unit === 'ms' || !unit) {
                    return value;
                }
            }
        }

        return 0;
    }

    /**
     * Format duration in human-readable format
     */
    private formatDuration(ms: number): string {
        if (ms < 1000) {
            return `${ms.toFixed(0)}ms`;
        } else if (ms < 60000) {
            return `${(ms / 1000).toFixed(1)}s`;
        } else if (ms < 3600000) {
            return `${(ms / 60000).toFixed(1)}min`;
        } else {
            return `${(ms / 3600000).toFixed(1)}h`;
        }
    }

    /**
     * Get a summary of insights by type
     */
    getInsightsSummary(insights: ExecutionInsight[]): {
        performance: number;
        cost: number;
        reliability: number;
        optimization: number;
        highImpact: number;
    } {
        return {
            performance: insights.filter(i => i.type === 'performance').length,
            cost: insights.filter(i => i.type === 'cost').length,
            reliability: insights.filter(i => i.type === 'reliability').length,
            optimization: insights.filter(i => i.type === 'optimization').length,
            highImpact: insights.filter(i => i.impact === 'high').length,
        };
    }
}

export const executionAnalyzerService = new ExecutionAnalyzerService();
export default ExecutionAnalyzerService;
