const RealHls = jest.requireActual('hls.js');

module.exports = jest.genMockFromModule('hls.js');
module.exports.Events = RealHls.Events;
module.exports.isSupported = jest.fn().mockReturnValue(true);
