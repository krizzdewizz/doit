const TAG = 'test-4ever:';
const log = (...args) => console.log.apply(console, [TAG, ...args]);
const error = (...args) => console.error.apply(console, [TAG, ...args]);

log('start.');
error('this is a test error.');

let count = 0;

setInterval(() => {
     log('ping', `${count}, ${new Date(Date.now())}\n  line2\n  line3`);
     count++;
}, 300);