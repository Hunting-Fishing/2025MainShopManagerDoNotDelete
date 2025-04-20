
import '@testing-library/jest-dom';

// Mock toast functionality
jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});
