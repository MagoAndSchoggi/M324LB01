"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForSocketState = exports.startServer = void 0;
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var livereload_1 = __importDefault(require("livereload"));
var connect_livereload_1 = __importDefault(require("connect-livereload"));
var websocketserver_1 = require("./websocketserver");
// Create the express server
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var myVar = 1;
// create a livereload server
var env = process.env.NODE_ENV || 'development';
if (env !== 'production' && env !== 'test') {
    var liveReloadServer_1 = livereload_1.default.createServer();
    liveReloadServer_1.server.once('connection', function () {
        setTimeout(function () {
            liveReloadServer_1.refresh('/');
        }, 100);
    });
    // use livereload middleware
    app.use((0, connect_livereload_1.default)());
}
// deliver static files from the client folder like css, js, images
app.use(express_1.default.static('client'));
// route for the homepage
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
// Initialize the websocket server
(0, websocketserver_1.initializeWebsocketServer)(server);
//start the web server
var startServer = function (serverPort) {
    server.listen(serverPort, function () {
        console.log("Express Server started on port ".concat(serverPort, " as '").concat(env, "' Environment"));
    });
    return server;
};
exports.startServer = startServer;
if (env !== 'test') {
    var serverPort = parseInt(process.env.PORT || '3000');
    startServer(serverPort);
}
var waitForSocketState = function (socket, state) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            if (socket.readyState === state) {
                resolve(undefined);
            }
            else {
                waitForSocketState(socket, state).then(resolve);
            }
        }, 5);
    });
};
exports.waitForSocketState = waitForSocketState;
