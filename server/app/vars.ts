import { Vars } from './model';

export class Varss {
    private regExs: { [v: string]: RegExp } = {};

    constructor(private vars: Vars) {
        Object.keys(this.vars).forEach(v => this.regExs[v] = new RegExp('\\$\\{(' + v + ')\\}', 'g'));
    }

    replace(s: string): string {
        if (s) {
            Object.keys(this.vars).forEach(v => s = s.replace(this.regExs[v], this.vars[v]));
        }
        return s;
    }
}

// function testIt() {
//     const vs = new Varss({
//         a: '17',
//         b: '88'
//     });
//     console.log(vs.replace('x${a}y${a}z${b}'));
// }

// testIt();