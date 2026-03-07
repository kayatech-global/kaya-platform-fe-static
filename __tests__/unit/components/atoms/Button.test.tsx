/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '@/components/atoms/button';

describe('Button Component', () => {
    // Cleanup after each test
    afterEach(() => {
        cleanup();
    });

    it('renders button with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies primary variant styles by default', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-blue-600');
    });

    it.each([
        ['primary', 'bg-blue-600'],
        ['secondary', 'bg-white'],
        ['semi-secondary', 'text-blue-700'],
        ['ghost', 'text-gray-500'],
        ['destructive', 'bg-red-600'],
        ['link', 'text-blue-700'],
    ])('renders %s variant with correct styles', (variant, expectedClass) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render(<Button variant={variant as any}>Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expectedClass);
    });

    it.each([
        ['sm', 'h-9'],
        ['md', 'h-10'],
        ['lg', 'h-11'],
        ['xl', 'h-12'],
        ['xxl', 'h-16'],
    ])('renders %s size correctly', (size, expectedClass) => {
        render(<Button size={size as any}>Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass(expectedClass);
    });

    it('shows loading state', () => {
        render(<Button loading>Click me</Button>);
        expect(screen.getByTestId('loader-circle')).toBeInTheDocument();
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders with leading icon', () => {
        const LeadingIcon = () => <span data-testid="leading-icon">icon</span>;
        render(<Button leadingIcon={<LeadingIcon />}>Click me</Button>);
        expect(screen.getByTestId('leading-icon')).toBeInTheDocument();
    });

    it('renders with trailing icon', () => {
        const TrailingIcon = () => <span data-testid="trailing-icon">icon</span>;
        render(<Button trailingIcon={<TrailingIcon />}>Click me</Button>);
        expect(screen.getByTestId('trailing-icon')).toBeInTheDocument();
    });

    it('handles disabled state', () => {
        render(<Button disabled>Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:cursor-auto');
    });

    it('handles click events when not disabled', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click events when disabled', () => {
        const handleClick = jest.fn();
        render(
            <Button disabled onClick={handleClick}>
                Click me
            </Button>
        );
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('combines custom className with default classes', () => {
        render(<Button className="custom-class">Click me</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('bg-blue-600'); // Default primary variant class
    });
});
