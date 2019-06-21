import { ErrorHandlerInstance } from '../ErrorHandler';

// noinspection JSUnusedGlobalSymbols
export const ErrorHandler = jest.fn().mockImplementation(() => {
  return {
    clearError: jest.fn(),
    handleError: jest.fn(),
    isDefinedError: jest.fn().mockReturnValue(false),
  } as ErrorHandlerInstance;
});
