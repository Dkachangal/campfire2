require('node:dns/promises').setServers(['1.1.1.1', '8.8.8.8']);
const http = require('http');
const { initializeServer } = require('./src/services/socket.service');
const app = require('./src/app');
const PORT = process.env.PORT || 10000;

const server = http.createServer(app);
initializeServer(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
});