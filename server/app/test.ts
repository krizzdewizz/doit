// const notifier = require('node-notifier');
// import * as path from 'path';
// import * as openurl from 'openurl';

// const open: (url: string, cb?: (err?: Error) => void) => void = openurl.open;

// notifier.notify({
//   'title': 'My notification',
//   'message': 'Hello, there!',
//   sound: true,
//   icon: path.join(__dirname, '48.png'),
//   wait: true
// }, (_err, response) => {
//   if (response === 'activate') {
//     open('http://localhost:8090');
//   }
// });

// const s = `
// Running "sass:dist" (sass) task
// >> Error: Invalid CSS after "#sidebar-wrapper {": expected "}", was "{} "
// >>         on line 20 of assets/sass/main.scss
// >> >> #sidebar-wrapper {{} `;

// const m = s.match(/^>> (Error.*)$/m);

// console.log(m ? m[1] : 'none')