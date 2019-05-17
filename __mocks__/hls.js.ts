const RealHls = jest.requireActual('hls.js');

const Hls: any = jest.genMockFromModule('hls.js');
Hls.Events = RealHls.Events;
Hls.isSupported = jest.fn().mockReturnValue(true);

module.exports = Hls;
