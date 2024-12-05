var toolbarOptions = [
    ['bold', 'italic'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']                    // Remove formatting button
];

document.addEventListener('DOMContentLoaded', function() {
    var quill = new Quill('#editor-container', {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    });

    const socket = io(`http://${SERVER_IP}:3000`);//server ->  
    
    socket.on('connect', function() {
        console.log('Socket.IO connection established');
    });

    socket.on('message', function(data) {
        try {
            console.log(`${getFormattedTimestamp()} Delta received`);
            var delta = JSON.parse(data);
            console.log(`${getFormattedTimestamp()} Delta parsed`, delta);
            quill.updateContents(delta);
        } catch (e) {
            console.error('Error parsing message', e);
        }
    });

    socket.on('disconnect', function(reason) {
        console.log('Socket.IO connection closed');
        console.log('Close reason:', reason);
    });

    socket.on('connect_error', function(error) {
        console.error('Socket.IO connection error:', error.message);
    });

    quill.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user' && socket.connected) {
            console.log(`${getFormattedTimestamp()} sending...`);
            socket.send(JSON.stringify(delta));
            console.log(`${getFormattedTimestamp()} Delta sent:`, delta);
        }
    });
});

function getFormattedTimestamp() {
    const now = new Date();
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    return `[sek:${seconds}, millisek:${milliseconds}]`;
  }