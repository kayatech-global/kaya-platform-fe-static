import React from 'react'
import '@testing-library/jest-dom'
// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '',
    query: {},
    asPath: '',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock next/image
jest.mock('next/image', () => {

  return {
    __esModule: true,
    default: function Image(props: any) {
      // eslint-disable-next-line @next/next/no-img-element
      return React.createElement('img', { ...props, alt: props.alt || '' })
    },
  }
})

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  LoaderCircle: function LoaderCircle(props: any) {
    return React.createElement('div', { 'data-testid': 'loader-circle', ...props }, 'LoaderCircle')
  },
}))

// Mock Radix UI Slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: React.ReactNode | ((props: any) => React.ReactNode) }) => {
    // If children is a function, call it with props
    if (typeof children === 'function') {
      return children(props)
    }
    // If children is a React element, clone it with props
    if (React.isValidElement(children)) {
      return React.cloneElement(children, props)
    }
    // Return children as is for other cases
    return children
  }
}))

jest.mock('./src/services/keycloak-service.ts', () => {
  return {
      KeycloakService: jest.fn().mockImplementation(() => {
          return {
              keycloak: {
                  init: jest.fn().mockResolvedValue(true),
              },
          };
      }),
  };
});
