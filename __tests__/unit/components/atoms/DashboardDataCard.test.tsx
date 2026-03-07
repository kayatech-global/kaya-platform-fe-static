import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardDataCard from '@/components/atoms/dashboard-data-card';

const MockIcon = () => <svg data-testid="icon" />;
const MockTrendIcon = () => <svg data-testid="trend-icon" />;

describe('DashboardDataCard', () => {
    const props = {
        title: 'Test Title',
        value: 42,
        description: 'increase in the last week',
        trendValue: '10%',
        trendColor: 'text-red-500',
        Icon: MockIcon,
        TrendIcon: MockTrendIcon,
        width: 320,
    };

    it('renders the component correctly with given props', () => {
        render(<DashboardDataCard {...props} />);

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('increase in the last week')).toBeInTheDocument();
        expect(screen.getByText('10%')).toBeInTheDocument();

        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(screen.getByTestId('trend-icon')).toBeInTheDocument();
    });

    it('should render different types of values (string, number, ReactNode)', () => {
        const stringValueProps = { ...props, value: 'Test Value' };
        const numberValueProps = { ...props, value: 100 };
        const reactNodeValueProps = {
            ...props,
            value: <span data-testid="react-node">React Node</span>,
        };

        render(<DashboardDataCard {...stringValueProps} />);
        expect(screen.getByText('Test Value')).toBeInTheDocument();

        render(<DashboardDataCard {...numberValueProps} />);
        expect(screen.getByText('100')).toBeInTheDocument();

        render(<DashboardDataCard {...reactNodeValueProps} />);
        expect(screen.getByTestId('react-node')).toBeInTheDocument();
    });
});
