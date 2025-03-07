"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebsocketServer = void 0;
var ws_1 = require("ws");
var lodash_1 = require("lodash");
var websocketServer;
var activeUsers = [];
var typingUsers = [];
// Broadcast a message to all connected clients
var broadcastMessage = function (message) {
    console.log('Broadcasting message', message);
    websocketServer.clients.forEach(function (client) {
        client.send(JSON.stringify(message));
    });
};
// Intiiate the websocket server
var initializeWebsocketServer = function (server) {
    websocketServer = new ws_1.Server({ server: server });
    websocketServer.on('connection', onConnection);
};
exports.initializeWebsocketServer = initializeWebsocketServer;
// If a new connection is established, the onConnection function is called
var onConnection = function (ws) {
    console.log('New websocket connection');
    ws.on('message', function (message) { return onMessage(ws, message); });
    ws.on('close', function () { return onClose(ws); });
};
// If a connection is closed, the onClose function is called
var onClose = function (ws) {
    console.log('Websocket connection closed');
    var userIndex = activeUsers.findIndex(function (user) { return user.ws === ws; });
    if (userIndex !== -1) {
        console.log('User disconnected:', activeUsers[userIndex].name);
        var removedUser = activeUsers.splice(userIndex, 1);
        removeTypingStatus(removedUser[0].id);
        broadcastMessage({
            type: 'activeUsers',
            users: activeUsers,
        });
    }
};
// Remove a user from the typingUsers array and broadcast the new list
var removeTypingStatus = function (userId) {
    var userIndex = typingUsers.findIndex(function (u) { return u.id === userId; });
    if (userIndex !== -1) {
        typingUsers.splice(userIndex, 1);
        broadcastMessage({
            type: 'typing',
            users: typingUsers,
        });
    }
};
var typingUsersDebounced = {};
// If a new message is received, the onMessage function is called
var onMessage = function (ws, message) {
    var _a, _b, _c, _d, _e, _f;
    var messageObject = JSON.parse(message.toString());
    console.log('Message received', messageObject);
    switch (messageObject.type) {
        case 'newUser':
            if (!((_a = messageObject.user) === null || _a === void 0 ? void 0 : _a.id) || activeUsers.find(function (user) { var _a; return user.id === ((_a = messageObject.user) === null || _a === void 0 ? void 0 : _a.id); }))
                return;
            activeUsers.push(__assign(__assign({}, messageObject.user), { ws: ws }));
            console.log('New user connected:', (_b = messageObject.user) === null || _b === void 0 ? void 0 : _b.name);
            broadcastMessage({
                type: 'activeUsers',
                users: activeUsers.map(function (user) { return ({ id: user.id, name: user.name }); }),
            });
            break;
        case 'message':
            if (!((_c = messageObject.user) === null || _c === void 0 ? void 0 : _c.id) || !messageObject.message)
                return;
            removeTypingStatus(messageObject.user.id);
            broadcastMessage({
                type: 'message',
                user: messageObject.user,
                message: messageObject.message,
            });
            break;
        case 'typing': {
            if (!((_d = messageObject.user) === null || _d === void 0 ? void 0 : _d.id))
                return;
            console.log('typing', (_e = messageObject.user) === null || _e === void 0 ? void 0 : _e.name);
            var existingUser = typingUsers.find(function (user) { var _a; return user.id === ((_a = messageObject.user) === null || _a === void 0 ? void 0 : _a.id); });
            if (existingUser) {
                (_f = typingUsersDebounced[messageObject.user.id]) === null || _f === void 0 ? void 0 : _f.cancel();
            }
            else {
                typingUsers.push(messageObject.user);
                broadcastMessage({
                    type: 'typing',
                    users: typingUsers,
                });
            }
            typingUsersDebounced[messageObject.user.id] = (0, lodash_1.debounce)(function () {
                var _a;
                if (!((_a = messageObject.user) === null || _a === void 0 ? void 0 : _a.id))
                    return;
                removeTypingStatus(messageObject.user.id);
            }, 2000);
            typingUsersDebounced[messageObject.user.id]();
            break;
        }
        default:
            break;
    }
};
