

## Project

### Testing out my implementation

- You'll need `node` and `yarn` installed
- Run `$ yarn` to install the `jest` package (the only dependency)
- Run `$ yarn test`
- Within the `src/controller.test.js` you can change the `backendResDelay` variable to change how long the backend
  takes to respond.

## Time

It took around 6 hours to complete this project.

## Some thoughts

### First pass at caching ranges

My first idea at solving this problem was to cache datapoints based off of time ranges. I would get a time range,
convert it into a string, so I can use it as the value in my cache map (eg: `'1234-5678'`). Although this might work
for whole date ranges, this becomes problematic for partial ranges. For example, if I had the range
`[1234-8999]`, the key `'1234-5678'` would be a partial match, but wouldn't help me find the rest of the ranges that
might contain partial cached data.

### Simplify the cache

I then realized it would be much simpler if I saved each data point in the cache with its time as the key. Since
I'm already calculating all the times to find the intervals, I could iterate over this new `timeList` and save
each piece in the cache.

### No need to average/roll up datapoints

Because I'm already building the intervals of datapoints, I don't need to find or average anything. I just iterate
over the intervals and grab the data from the cache. While iterating, I also find start/stop points for null
values, which allows me to limit the amount of data requested from the backend.



### Assumptions and thoughts

- Users can make many requests before the first request resolves, so I only resolve the most recent response - all other
  responses are thrown out after the backend is done (after caching the data).
- I added timestamps to each of the requests to keep track of responses. We could also use uuid's or
  something, but I figured this was fine for this assignment.
- I'm assuming the backend is giving the time back to me in the response (within the `datapoint`), so I can cache it.
  This is why I made the datapoint an object - assuming that was the structure.

### Small bit of feedback

The API docs state that the `backend` should be passed into the `Controller` constructor, but the `backend`
also needs to call the `controller` when the calls are finished. This is a circular dependency and was a bit
strange to implement (see `src/controller.js` on lines 6-8 for my implementation).

I would probably recommend not passing the backend into the `Controller`, and instead using it as a dependency that
resolves a promise:

```javascript
const { backend } = require('./backend');

class Controller {
  setStartTime = () => {
    backend.requestTemperatureData()
      .then(this.receiveTemperatureData); 
  }

  receiveTemperatureData = () => {
    // this method will be called when the backend request resolves
  }
}
```
