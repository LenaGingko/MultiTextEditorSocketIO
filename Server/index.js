const { createServer } = require("http");
const { readFile } = require("fs/promises");
const { Server } = require("socket.io");
const path = require("path");

const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const httpServer = createServer(async (req, res) => {
    try {
        if (req.method === "GET" && req.url === "/") {
            try {
                const html = await readFile(path.join(__dirname, "../Client/index.html"), "utf8");
                const modifiedHtml = html.replace(
                    "</head>",
                    `<script>const SERVER_IP = "${IP_ADDRESS}";</script></head>`
                );
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(modifiedHtml);
            } catch (error) {
                console.error("Error loading index.html:", error.message);
                res.writeHead(500).end("Internal Server Error");
            }
        } else if (req.method === "GET" && req.url === "/client.js") {
            try {
                const content = await readFile(path.join(__dirname, "../Client/client.js"));
                res.writeHead(200, { "Content-Type": "application/javascript" });
                res.end(content);
            } catch (error) {
                console.error("Error loading client.js:", error.message);
                res.writeHead(500).end("Internal Server Error");
            }
        } else if (req.method === "GET" && req.url === "/favicon.ico") {
            const favicon = await readFile("./assets/favicon.ico");
            res.writeHead(200, {
            "content-type": "image/x-icon"
            });
            res.end(favicon);
        } else {
            console.log(`server sends 404 error for ${req.url}`);
            res.writeHead(404).end();
        }
    } catch (error) {
        console.error("Error serving file:", error.message);
        res.writeHead(500).end("Internal Server Error");
    }
});

const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        // Broadcast the message to all other clients
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;
const IP_ADDRESS = process.env.LOCAL_IP;

httpServer.listen(PORT, IP_ADDRESS, () => {
    console.log(`HTTP server is listening on http://${IP_ADDRESS}:${PORT}`);
});