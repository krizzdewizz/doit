const doit = 'D:\\data\\doit\\'
const grunt = 'C:\\Users\\gigi\\AppData\\Roaming\\npm\\node_modules\\grunt\\bin\\grunt'
const gruntBuild = [grunt, 'build'];

module.exports = {
    editor: 'D:\\prg\\notepad++\\notepad++.exe',
    tasks: [{
        title: 'test-4everxaa2242x',
        command: 'node',
        args: [
            'test-4ever'
        ],
        cwd: `${doit}server\\app`
    },
    {
        title: 'doit - client build',
        command: 'node',
        args: gruntBuild,
        cwd: `${doit}client`
    },
    {
        title: 'doit - server build',
        command: 'node',
        args: gruntBuild,
        cwd: `${doit}server`
    },
    {
        title: 'doit - watch:sass',
        command: 'node',
        args: [
            grunt,
            'watch:sass'
        ],
        cwd: `${doit}client`,
        problemPattern: '^>> (Error:.*)$',
        autoStart: true
    }]
}