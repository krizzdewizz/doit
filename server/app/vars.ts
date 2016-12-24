import { Vars } from './model';

export class Varss {
    constructor(private vars: Vars) {
    }

    replace(s: string): string {
        if (!s) {
            return s;
        }
        Object.keys(this.vars).forEach(k => s = s.replace(new RegExp('\\$\\{(' + k + ')\\}', 'g'), this.vars[k]));
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