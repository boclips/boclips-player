import { EndOverlay } from './SharedFeatures';
import { describe, expect, beforeEach, it } from '@jest/globals';


describe('creating EndOfVideoOverlay', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div') as any;
    const plyrContainer = document.createElement('div') as any;
    plyrContainer.__jsdomMockClientWidth = 700;
    container.appendChild(plyrContainer);
    document.body.appendChild(container);
  });

  it('appends overlay to plyrContainer after EndOverlay is called', () => {
    EndOverlay.createIfNotExists(container);
    expect(
      container.innerHTML.includes(EndOverlay.overlayClassName),
    ).toBeTruthy();
  });

  it('returned container contains the overlay', () => {
    const retrievedOverlay = EndOverlay.createIfNotExists(container);

    expect(
      retrievedOverlay.className.includes(EndOverlay.overlayClassName),
    ).toBeTruthy();
  });

  it('finds exisiting overlay and appends to plyrContainer', () => {
    const endVideoOverlay = document.createElement('div');
    endVideoOverlay.className = EndOverlay.overlayClassName;
    endVideoOverlay.innerHTML = 'test';

    container.appendChild(endVideoOverlay);

    EndOverlay.createIfNotExists(container);
    expect(container.innerHTML.includes('test')).toBeTruthy();
  });
});

describe('removing endOfVideoOverlay', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div') as any;

    const plyrContainer = document.createElement('div') as any;
    plyrContainer.__jsdomMockClientWidth = 700;

    const endVideoOverlay = document.createElement('div');
    endVideoOverlay.className = EndOverlay.overlayClassName;

    container.appendChild(endVideoOverlay);
    container.appendChild(plyrContainer);
    document.body.appendChild(container);
  });

  it('finds overlay and removes it from container', () => {
    EndOverlay.destroyIfExists(container);
    expect(
      container.innerHTML.includes(EndOverlay.overlayClassName),
    ).toBeFalsy();
  });
});
