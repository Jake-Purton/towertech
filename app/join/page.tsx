"use client";

import { useEffect, useState } from "react";
import { socket } from "../src/socket";
import { JoinRoomMessage } from "../src/messages";
import { useRouter } from 'next/navigation';

const JoinPage: React.FC = () => {
    const router = useRouter()
    const [number, setNumber] = useState('');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [transport, setTransport] = useState<string>("N/A");
    const [message, setMessage] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    
    
    useEffect(() => {
        // Check if the socket is already connected on component mount
        if (socket.connected) {
            onConnect();
        }
        
        function onMessage(msg: string) {
            setMessage(msg);
            console.log(msg);
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport: { name: string }) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onRoomErr(err: string) {
            setMessage(err);
        }

        function onSuccess() {
            router.push('/join/room');
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message", onMessage);
        socket.on("RoomErr", onRoomErr);
        socket.on("roomJoinSuccess", onSuccess);

        return () => {
            // Cleanup function to remove event listeners
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message", onMessage);
            socket.off("RoomErr", onRoomErr);
            socket.off("roomJoinSuccess", onSuccess);
        };
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (number === "") {
            setMessage("Please enter a join code");
            return;
        }
        if (username === "") {
            setMessage("Please enter a username");
            return;
        }
        dataSender(number, username);
    };

    const dataSender = (code: string, username: string) => {
        if (socket.id) {
            var join_message = new JoinRoomMessage(socket.id, code, username);
            socket.emit("JOIN_ROOM", join_message);
        } else {
            setMessage("Socket ID is undefined");
        }

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
            <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Join Code</h1>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
                <label className="text-lg font-medium w-full">
                    <p className="text-red-500 text-center">{message}</p>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2 p-2 border border-gray-600 rounded-full text-black appearance-none w-full"
                        placeholder="Username"
                    />
                    <br></br>
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="mt-2 p-2 border border-gray-600 rounded-full text-black appearance-none w-full"
                        placeholder="Join Code"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit(e);
                            }
                        }}  
                    />
                </label>
                <button type="submit" className="mt-6 px-4 py-2 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-all">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default JoinPage;