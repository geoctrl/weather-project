
exports.buildTimeList = (startTime, endTime, resolution) => {
  const units = (endTime - startTime) / resolution;
  return [...Array(units)].map((v, i) => startTime + (resolution * i));
};

exports.getResolution = (startTime, endTime) => {
  const diff = endTime - startTime;
  // [0, 2 hours) => 1 minute
  if (diff < 7200) {
    return 60;
    // [2 hours, 1 week) => 5 minutes
  } else if (diff < 604800) {
    return 300;
    // [1 week, ∞) => 1 hour
  } else {
    return 3600;
  }
};

exports.fillGaps = (startTime, endTime, data) => {

}
