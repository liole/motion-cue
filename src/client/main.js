import dom from '/dom.js';

dom('#app').append(dom.new('div', { style: 'color:red'}, ['hello']));

var socket = io();

socket.on('connect', () => {
    console.log(socket.id);
    socket.emit('create', { type: 'test' });
});

socket.on('created', ({id}) => console.log(id));
