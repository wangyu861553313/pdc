import '@testing-library/jest-dom';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock window.getComputedStyle
// Create a simple but complete CSSStyleDeclaration mock
const createMockStyle = (): CSSStyleDeclaration => {
  const styleProperties: Record<string, string> = {};

  const mockStyle: any = {
    getPropertyValue: (prop: string) => {
      return styleProperties[prop] || '';
    },
    setProperty: (prop: string, value: string) => {
      styleProperties[prop] = value;
    },
    removeProperty: (prop: string) => {
      const value = styleProperties[prop] || '';
      delete styleProperties[prop];
      return value;
    },
    getPropertyPriority: () => '',
    item: (index: number) => {
      const keys = Object.keys(styleProperties);
      return keys[index] || '';
    },
    length: 0,
    parentRule: null,
    cssText: '',
  };

  // Add common CSS properties as getters
  const commonProps = [
    'display',
    'visibility',
    'opacity',
    'position',
    'top',
    'left',
    'right',
    'bottom',
    'width',
    'height',
    'margin',
    'padding',
    'border',
    'backgroundColor',
    'color',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'textAlign',
    'zIndex',
    'overflow',
    'overflowX',
    'overflowY',
    'transform',
    'transition',
    'animation',
  ];

  commonProps.forEach((prop) => {
    Object.defineProperty(mockStyle, prop, {
      get: () => styleProperties[prop] || '',
      set: (value: string) => {
        styleProperties[prop] = value;
      },
      enumerable: true,
      configurable: true,
    });
  });

  // Use Proxy to handle any other property access
  return new Proxy(mockStyle, {
    get(target, prop: string | symbol) {
      if (prop in target) {
        return target[prop];
      }
      // Return empty string for any CSS property not explicitly defined
      if (typeof prop === 'string') {
        return '';
      }
      return undefined;
    },
    set(target, prop: string | symbol, value: any) {
      target[prop] = value;
      return true;
    },
    has(target, prop: string | symbol) {
      return prop in target || typeof prop === 'string';
    },
  }) as CSSStyleDeclaration;
};

// Mock window.getComputedStyle - set it before any code runs
const mockGetComputedStyle = () => {
  return createMockStyle();
};

// Set on window if available
if (typeof window !== 'undefined') {
  (window as any).getComputedStyle = mockGetComputedStyle;
  Object.defineProperty(window, 'getComputedStyle', {
    writable: true,
    configurable: true,
    value: mockGetComputedStyle,
  });
}

// Also set on global for compatibility
if (typeof global !== 'undefined') {
  (global as any).getComputedStyle = mockGetComputedStyle;
}
