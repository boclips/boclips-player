import { EndOverlay } from './SharedFeatures';

describe('Class creates or finds overlay and attaches to plyContainer', () => {
  let container: HTMLDivElement;
  beforeEach(() => {
    container = document.createElement('div') as any;
    const plyrContainer = document.createElement('div') as any;
    plyrContainer.__jsdomMockClientWidth = 700;
    container.appendChild(plyrContainer);
  });
  it('appends overlay to plyrContainer after EndOverlay is called', () => {
    EndOverlay.createIfNotExists(container);
    expect(container.innerHTML.includes('overlay')).toBeTruthy();
  });
  it('finds exisiting overlay and appends to plyrContainer', () => {
    document.body.innerHTML =
      '<div>' + '  <button id="overlay">test</button>' + '</div>';
    EndOverlay.createIfNotExists(container);
    expect(container.innerHTML.includes('test')).toBeTruthy();
  });
});
