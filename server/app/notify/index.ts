import * as notifier from 'node-notifier';
import * as path from 'path';
import * as openurl from 'openurl';

import { PORT } from '../env';

export function notify(taskId: number, title: string, message: string) {
    notifier.notify({
        title,
        message,
        //sound: true,
        wait: true,
        icon: path.join(__dirname, 'error.png')
    }, (_err, response) => {
        if (response === 'activate') {
            openurl.open(`http://localhost:${PORT}/#${taskId}`);
        }
    });
}