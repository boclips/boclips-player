import { StreamingTechnique } from '../StreamingTechnique';

export const MockStreamingTechnique: StreamingTechnique = {
  initialise: jest.fn(),
  startLoad: jest.fn(),
  stopLoad: jest.fn(),
  destroy: jest.fn(),
};

// noinspection JSUnusedGlobalSymbols
export const StreamingTechniqueFactory = {
  get: jest.fn().mockReturnValue(MockStreamingTechnique),
};
