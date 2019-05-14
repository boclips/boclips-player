import PlyrWrapper from './PlyrWrapper';

it("returns it's source object", () => {
  const element = document.createElement('video');
  element.setAttribute('data-plyr-provider', 'html5');
  document.body.appendChild(element);
  const provider = new PlyrWrapper(element);

  provider.source = {
    type: 'video',
    title: 'A test video',
    poster: '/path/to/poster.jpg',
    sources: [
      {
        src: '/path/to/movie.mp4',
        type: 'video/mp4',
        size: 720,
        provider: 'html5',
      },
    ],
  };
});
