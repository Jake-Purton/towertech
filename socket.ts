"use client";

import { io, Socket } from "socket.io-client";

interface CustomSocket extends Socket {
    sendMessageToServer(): void;
    sendMessageToClient(): void;
}

export const socket: CustomSocket = io() as CustomSocket;

socket.sendMessageToServer = function() {
    console.log("Custom method called");
};

socket.sendMessageToServer = function() {
    console.log("Custom method called");
};