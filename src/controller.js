const Cache = require('./cache');
const { getResolution } = require('./utils');

module.exports = class Controller {
  constructor(ui, backend, startTime, endTime) {
    // pass the controller instance to the backend
    // so the backend can call "receiveTemperatureData" on request completion
    backend.passControllerInstance(this);

    this.cache = new Cache();
    this.ui = ui;
    this.backend = backend;

    // save for next use
    this.startTime = startTime;
    this.endTime = endTime;

    this.possiblyMakeRequest(startTime, endTime);
  }


  setStartTime = (startTime) => {
    this.startTime = startTime;
    this.possiblyMakeRequest(this.startTime, this.endTime);
  }


  setEndTime = (endTime) => {
    this.endTime = endTime;
    this.possiblyMakeRequest(this.startTime, this.endTime);
  }

  possiblyMakeRequest = (startTime, endTime) => {
    const resolution = getResolution(startTime, endTime);

    // get cached data
    const { cachedData, startTimeNull, endTimeNull } = this.cache.get(startTime, endTime, resolution);

    // update UI with cached data
    this.ui.setChartData(cachedData);

    // request data if there's any holes in the cache
    if (startTimeNull && endTimeNull) {
      const timestamp = Date.now();
      // backend requires full time range, marking the endTime as exclusive
      // add extra interval to account for that
      const endTimeExclusive = endTimeNull + resolution;
      this.backend.requestTemperatureData(startTimeNull, endTimeExclusive, resolution, timestamp);

      // save for when the backend call finishes
      // also save some data so we can test against it
      this.request = {
        startTimeNull: startTimeNull,
        endTimeNull: endTimeExclusive,
        timestamp,
        cachedData,
      };
    }
  }


  receiveTemperatureData = (startTime, endTime, resolution, datapoints, timestamp) => {
    // always set cache
    this.cache.set(datapoints);

    // update UI if there's no other response in flight
    if (timestamp === this.request?.timestamp) {
      const freshData = this.request.cachedData.map((old, i) => {
        return old === null ? datapoints[i] : old;
      })

      // update ui
      this.ui.setChartData(freshData);

      // delete request
      this.request = null;
    }
  }
}
