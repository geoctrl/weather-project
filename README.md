

## Project

### Testing out my implementation

- You'll need `node` and `yarn` installed
- Run `$ yarn` to install the `jest` package (the only dependency)
- Run `$ yarn test`
- Within the `src/controller.test.js` you can change the `backendResDelay` variable to change how long the backend
  takes to respond.

## My thought process while working on this project

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
- It would be nice if we could cancel backend calls that get thrown out. That would increase loading performance
  if users try fetching lots of data quickly. That can be done with a tool like `axios` or using `AbortController`
  with fetch.
- I added timestamps to each of the requests to keep track of responses. We could also use uuid's or
  something, but I figured this was fine for this assignment.
- I'm assuming the backend is giving the time back to me in the response (within the `datapoint`), so I can cache it.
  This is why I made the datapoint an object - assuming that was the structure.
