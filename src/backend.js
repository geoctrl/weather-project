const { buildTimeList } = require('./utils');

module.exports = class Backend {
  constructor(responseDelay) {
    this.responseDelay = responseDelay;
  }

  passControllerInstance(controllerInstance) {
    this.controllerInstance = controllerInstance;
  }

  async requestTemperatureData(startTime, endTime, resolution, timestamp) {
    // simulate slow request
    if (this.responseDelay) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }

    // endTime is exclusive, but our buildTimeList function uses that number to build intervals (datapoints)
    // so this is a little hack that allows us to reuse that method for faking out datapoints
    // (just need to grab the last datapoint)

    // simulate backend request with fake data
    // [{ 'time': number }]
    const datapoints = buildTimeList(startTime, endTime, resolution).map(time => ({ time }));

    // call controller with new data
    this.controllerInstance.receiveTemperatureData(startTime, endTime, resolution, datapoints, timestamp);
  }
}
