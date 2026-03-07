# Testing Documentation

This directory contains all the test files for the Kaya Platform Admin Frontend. We use Jest and React Testing Library for our testing framework.

## Table of Contents
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Debugging Tests](#debugging-tests)
- [Writing Tests](#writing-tests)
  - [Naming Conventions](#naming-conventions)
  - [File Structure](#file-structure)
  - [Test Structure](#test-structure)
- [Best Practices](#best-practices)

## Getting Started

Our testing setup uses the following key packages:
- Jest: Testing framework
- React Testing Library: Component testing utilities
- @testing-library/jest-dom: Custom DOM element matchers

## Running Tests

We have several npm scripts for running tests:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Debugging Tests

We have VS Code launch configurations set up for debugging tests. To use them:

1. Open the test file you want to debug
2. Set breakpoints by clicking on the line numbers
3. Press F5 or select Run > Start Debugging
4. Choose one of the following configurations:
   - "Debug Jest Tests": Run all tests
   - "Debug Current Jest Test File": Run only the current file
   - "Debug Jest Tests (Watch Mode)": Run tests in watch mode

## Writing Tests

### Naming Conventions

- Test files should be named `*.test.tsx` or `*.test.ts`
- Test files should be placed in `__tests__` directories
- Test files should mirror the structure of the source code
- Test descriptions should clearly indicate what is being tested

Example:
```typescript
// Good
describe('Button Component', () => {
  it('renders with children', () => {})
  it('handles click events', () => {})
})

// Bad
describe('test', () => {
  it('should work', () => {})
})
```

### File Structure

Tests should mirror the source code structure:

```
src/
  components/
    atoms/
      Button.tsx
__tests__/
  components/
    atoms/
      Button.test.tsx
```

### Test Structure

Follow this structure for component tests:

1. Render tests
2. Prop tests
3. Event handler tests
4. State tests
5. Edge cases

Example:
```typescript
describe('ComponentName', () => {
  // 1. Render tests
  it('renders without crashing', () => {})
  it('renders with required props', () => {})

  // 2. Prop tests
  it('applies className correctly', () => {})
  it('handles different variants', () => {})

  // 3. Event handler tests
  it('calls onClick when clicked', () => {})

  // 4. State tests
  it('updates state on user interaction', () => {})

  // 5. Edge cases
  it('handles empty props gracefully', () => {})
})
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests

2. **Cleanup**: Use cleanup after each test to prevent test pollution
```typescript
afterEach(() => {
  cleanup()
})
```

3. **Meaningful Assertions**: Test behavior, not implementation
```typescript
// Good
expect(screen.getByRole('button')).toBeEnabled()

// Bad
expect(component.props.disabled).toBe(false)
```

4. **User-centric Testing**: Write tests that reflect how users interact with components
```typescript
// Good
fireEvent.click(screen.getByText('Submit'))

// Bad
component.props.onClick()
```

5. **Avoid Implementation Details**: Test what the component does, not how it does it
```typescript
// Good
expect(screen.getByText('Success')).toBeInTheDocument()

// Bad
expect(component.state.isSuccess).toBe(true)
```

For more information about the project setup and other details, refer to the [main README](../README.md).
