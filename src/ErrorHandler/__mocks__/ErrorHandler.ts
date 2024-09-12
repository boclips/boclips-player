import { jest } from '@jest/globals';
import { ErrorHandlerInstance } from '../ErrorHandler';

// noinspection JSUnusedGlobalSymbols
export const ErrorHandler = jest.fn().mockImplementation(() => {
  return ErrorHandlerProps;
});

export const ErrorHandlerProps = {
  clearError: jest.fn(),
  handleError: jest.fn(),
  isDefinedError: jest.fn().mockReturnValue(false),
  onError: jest.fn(),
} as ErrorHandlerInstance;
