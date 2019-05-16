const RealHls = jest.requireActual('hls.js');

module.exports = jest.fn().mockImplementation(() => {
  return {
    attachMedia: jest.fn(),
    on: jest.fn(),
    loadSource: jest.fn(),
  };
});
module.exports.Events = RealHls.Events;
module.exports.isSupported = jest.fn().mockReturnValue(true);
