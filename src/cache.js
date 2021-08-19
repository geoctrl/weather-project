const { buildTimeList } = require('./utils');

module.exports = class Cache {
  constructor() {
    this.timeDataMap = {};
  }

  /**
   * if datapoints don't already exist in cache, save
   * @param datapoints
   */
  set(datapoints) {
    datapoints.forEach(datapoint => {
      if (datapoint && !this.timeDataMap[datapoint.time]) {
        this.timeDataMap[datapoint.time] = datapoint;
      }
    });
  }

  /**
   * get cached data and also calculate start/end dates for null points
   * @param startTime
   * @param endTime
   * @param resolution
   * @returns {{cachedData, endTimeNull, startTimeNull}}
   */
  get(startTime, endTime, resolution) {
    const timeList = buildTimeList(startTime, endTime, resolution);
    let startTimeNull;
    let endTimeNull;
    const cachedData = timeList.map((time, i) => {
      const foundTime = this.timeDataMap[time] || null;
      if (typeof startTimeNull !== 'number' && foundTime === null) {
        startTimeNull = time;
      } else if (foundTime === null) {
        endTimeNull = time;
      }
      return foundTime;
    });
    return {
      cachedData,
      startTimeNull,
      endTimeNull,
    }
  }
}
