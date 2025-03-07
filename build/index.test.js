"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var index_1 = require("./index");
var port = 3000;
describe('WebSocket Server', function () {
    var server;
    var user;
    var client = ws_1.WebSocket;
    var testNewUserMessage;
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = {
                        id: '1',
                        name: 'Test User',
                    };
                    return [4 /*yield*/, (0, index_1.startServer)(port)];
                case 1:
                    server = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterAll(function () { return server.close(); });
    test('Send "New User" from Client', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testMessage, client, responseMessage, expectedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testMessage = {
                        type: 'newUser',
                        user: user,
                    };
                    client = new ws_1.WebSocket("ws://localhost:".concat(port));
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.OPEN)];
                case 1:
                    _a.sent();
                    client.on('message', function (data) {
                        responseMessage = JSON.parse(data.toString());
                        // Close the client after it receives the response
                        client.close();
                    });
                    // Send client message
                    client.send(JSON.stringify(testMessage));
                    // Perform assertions on the response
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.CLOSED)];
                case 2:
                    // Perform assertions on the response
                    _a.sent();
                    expectedMessage = {
                        type: 'activeUsers',
                        users: [user],
                    };
                    expect(responseMessage).toEqual(expectedMessage);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Send "Message" from Client', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testMessage, client, responseMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testMessage = {
                        type: 'message',
                        user: user,
                        message: 'Test Message',
                    };
                    client = new ws_1.WebSocket("ws://localhost:".concat(port));
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.OPEN)];
                case 1:
                    _a.sent();
                    client.on('message', function (data) {
                        responseMessage = JSON.parse(data.toString());
                        // Close the client after it receives the response
                        client.close();
                    });
                    // Send client message
                    client.send(JSON.stringify(testMessage));
                    // Perform assertions on the response
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.CLOSED)];
                case 2:
                    // Perform assertions on the response
                    _a.sent();
                    expect(responseMessage).toEqual(testMessage);
                    return [2 /*return*/];
            }
        });
    }); });
    test('Send "typing" from Client and wait until not typing timeout', function () { return __awaiter(void 0, void 0, void 0, function () {
        var testMessage, client, responseMessages, messageCounter, expectedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testMessage = {
                        type: 'typing',
                        user: user,
                    };
                    client = new ws_1.WebSocket("ws://localhost:".concat(port));
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.OPEN)];
                case 1:
                    _a.sent();
                    responseMessages = [];
                    messageCounter = 0;
                    client.on('message', function (data) {
                        responseMessages.push(JSON.parse(data.toString()));
                        messageCounter++;
                        // Close the client after it receives the response
                        if (messageCounter >= 2) {
                            client.close();
                        }
                    });
                    // Send client message
                    client.send(JSON.stringify(testMessage));
                    // Perform assertions on the response
                    return [4 /*yield*/, (0, index_1.waitForSocketState)(client, client.CLOSED)];
                case 2:
                    // Perform assertions on the response
                    _a.sent();
                    expectedMessage = {
                        type: 'typing',
                        users: [user],
                    };
                    expect(responseMessages[0]).toEqual(expectedMessage);
                    expect(responseMessages[1]).toEqual({ type: 'typing', users: [] });
                    return [2 /*return*/];
            }
        });
    }); });
});
