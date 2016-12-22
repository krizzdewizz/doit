module DoIt {

    let socket: SocketIOClient.Socket;

    export function start(taskId: string) {
        // fetch(`/start?task=${taskId}`).then(response => {
        //     console.log(response);
        // });
        socket.emit('doit', { action: 'start', taskId: Number(taskId) });
    }

    export function stop() {
        alert('xxxxxxxxx');
    }

    $(document).ready(() => {
        socket = io.connect();
        socket.on('doit', _data => {
            // const task = data.task;
            // console.log('task running', task.running);
        });
    });
}
