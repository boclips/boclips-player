import { ErrorHandlerInstance } from '../ErrorHandler';

// noinspection JSUnusedGlobalSymbols
export const ErrorHandler = jest.fn().mockImplementation(() => {
  return {
    clearError: jest.fn(),
    handleError: jest.fn(),
  } as ErrorHandlerInstance;
});
