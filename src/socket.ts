"use client";

import { io, Socket } from "socket.io-client";
import { MessageToServerType } from "./messages";

interface CustomSocket extends Socket {
    sendMessage(messageType: MessageToServerType, message: string): void;
}

export const socket: CustomSocket = io() as CustomSocket;

socket.sendMessage = function(messageType: MessageToServerType, message: string) {
    console.log(messageType, message);
};