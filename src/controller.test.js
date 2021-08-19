const Controller = require('./controller');
const Backend = require('./backend');
const UI = require('./ui');

const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));

describe('Sweater Weather', function () {
  const backendResDelay = 1000;
  const twelveThirtyPm = 1628512200;
  const onePm = 1628514000;
  const twoPm = 1628517600;
  const threePm = 1628521200;
  let controller;

  const ui = new UI();
  const backend = new Backend(backendResDelay);

  test('should initialize controller', async () => {
    controller = new Controller(ui, backend, onePm, twoPm);

    // everything is null (60 datapoints)
    expect(ui.datapoints.every(d => d === null)).toBe(true);
    expect(ui.datapoints.length).toBe(60);
    await delay(backendResDelay);

    expect(ui.datapoints.length).toBe(60);
    expect(ui.datapoints[ui.datapoints.length - 1].time).toBe(twoPm - 60);
  });

  test('reduce start time by 30 minutes', async () => {
    controller.setStartTime(twelveThirtyPm);

    // request the smallest amount of data from the backend
    const timeDiff = controller.request.endTimeNull - controller.request.startTimeNull;
    expect(timeDiff / 60).toBe(30);

    // 30 datapoints should be null (rest is filled from cache)
    expect(ui.datapoints.filter(d => d === null).length).toBe(30);
    await delay(backendResDelay);

    // backend responds and fill cache and ui with new data
    expect(ui.datapoints.every(d => d)).toBe(true);
  });

  test('change resolution', async () => {
    controller.setEndTime(threePm);

    // request the smallest amount of data from the backend
    const requestTimeDiff = controller.request.endTimeNull - controller.request.startTimeNull;
    expect(requestTimeDiff / 60 / 60).toBe(1); // hours (2pm -> 3pm)

    // full time should be 2.5 hours
    const timeDiff = controller.endTime - controller.startTime;
    expect(timeDiff / 60 / 60).toBe(2.5); // hours (12:30pm -> 3pm)

    await delay(backendResDelay);
  });

  test('handle multiple amounts of requests', async () => {
    // user makes many requests quickly
    controller = new Controller(ui, backend, onePm, twoPm);
    const setChartDataSpy = jest.spyOn(ui, 'setChartData');

    controller.setStartTime(twelveThirtyPm);
    controller.setEndTime(twoPm);
    controller.setStartTime(onePm);

    await delay(backendResDelay);

    // the UI is updated twice on init and on set*
    // to optimize, we're throwing out backend responses if there's another response in flight
    // without optimizing, the method would be called 8 times
    expect(setChartDataSpy).toHaveBeenCalledTimes(4);

    // we expect the time to be 1 hour (12:30pm -> 3pm)
    const timeDiff = controller.endTime - controller.startTime;
    expect(timeDiff / 60 / 60).toBe(1);

    // even though the time is set to 1 hour, the cache should contain all the data
    // gathered up to this point (1.5 hours)
    expect(Object.keys(controller.cache.timeDataMap).length / 60).toBe(1.5);
  });
});
