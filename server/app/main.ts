import * as fs from 'fs';
import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

import { taskSocket } from './task-ws';

const bodyParser = require('body-parser');

const PORT = 8081;
const prod = process.env.NODE_ENV === 'production';

const CLIENT_ROOT = '../../client' + (prod ? '/.dist' : '');

function staticc(path: string) {
    return express.static(`${__dirname}/${CLIENT_ROOT}/${path}`);
}

function html5(_req: express.Request, res: express.Response) {
    // console.log('req.url=', req.url);
    // res.redirect('/index.html'); ->> does not work as expected
    fs.createReadStream(`${__dirname}/${CLIENT_ROOT}/assets/index.html`).pipe(res);
}

// define static mime type for fonts to load them correctly
express.static.mime.define({ 'application/x-font-ttf': ['ttf'] });

const app = express()
    .use(bodyParser.json())

    // .get('/products/search', productSearch)
    // .get('/code', code)

    .use('/node_modules', staticc(`node_modules`))
    .use('/app', staticc('app'))
    .use('/assets/styles', staticc('assets/styles'))
    .use('/assets/scripts', staticc('assets/scripts'))
    .use('/index.html', staticc('assets/index.html'))
    .use('/assets/images', staticc('assets/images'))
    .all('/*', html5)
    ;


const server = http.createServer(app);
const io = socketIo.listen(server);

io.sockets.on('connection', taskSocket(io));

server.listen(PORT, () => {
    console.log(`doit task server listening on port ${PORT}...`);
});