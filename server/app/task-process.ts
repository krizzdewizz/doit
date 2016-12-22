import * as child_process from 'child_process';
import * as stream from 'stream';

// const os = process.env.OS || '';
// const ARG_QUOTE = os.toLowerCase().indexOf('windows') >= 0 ? '"' : '\'';

// export function quote(arg: string): string {
//     return ARG_QUOTE + arg + ARG_QUOTE;
// }

export function spawn(command: string, args: string[], outStream: stream.Writable, errStream: stream.Writable): void {
    const s = child_process.spawn(command, args);
    s.stdout.setEncoding('utf8');
    s.stdout.pipe(outStream);
    s.stderr.pipe(errStream);
}