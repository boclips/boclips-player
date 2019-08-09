export interface HasEventListeners {
  __eventListeners: {
    [eventName: string]: Array<(event: Event | any) => void>;
  };
  clearEventListeners: () => void;
}
