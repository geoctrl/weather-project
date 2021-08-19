module.exports = class UI {
  constructor() {
    this.datapoints = [];
  }
  setChartData(datapoints) {
    this.datapoints = datapoints;
  }
}
