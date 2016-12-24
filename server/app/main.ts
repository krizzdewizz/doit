import * as fs from 'fs';
import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

import { taskSocket } from './task-ws';
import { setupWatcher } from './task';

setupWatcher();

const bodyParser = require('body-parser');

const PORT = 8090;
const prod = Boolean(process.argv.find(it => it === '-p'));

const CLIENT_ROOT = '../../client' + (prod ? '/.dist' : '');

function staticc(path: string) {
    return express.static(`${__dirname}/${CLIENT_ROOT}/${path}`);
}

function html5(_req: express.Request, res: express.Response) {
    fs.createReadStream(`${__dirname}/${CLIENT_ROOT}/assets/index.html`).pipe(res);
}

// define static mime type for fonts to load them correctly
express.static.mime.define({ 'application/x-font-ttf': ['ttf'] });

const app = express()
    .use(bodyParser.json())
    .use('/node_modules', staticc(`node_modules`))
    .use('/app', staticc('app'))
    .use('/assets', staticc('assets'))
    .use('/index.html', staticc('assets/index.html'))
    .all('/*', html5)
    ;


const server = http.createServer(app);
const io = socketIo.listen(server);

io.sockets.on('connection', taskSocket(io));

server.listen(PORT, () => {
    const log = console.log;
    log(`'doit' task server (${prod ? 'prod' : 'debug'}) listening on port ${PORT}...`);
});