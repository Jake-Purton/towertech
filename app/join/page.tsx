"use client";

import { useEffect, useState } from "react";
import { socket } from "../../socket";

const JoinPage: React.FC = () => {
    const [number, setNumber] = useState('');
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [transport, setTransport] = useState<string>("N/A");
    const [message, setMessage] = useState<string>("No message");

    
    
    useEffect(() => {
        // Check if the socket is already connected on component mount
        if (socket.connected) {
            onConnect();
        }
        
        function onMessage(msg: string) {
            setMessage(msg);
            alert(msg);
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

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message", onMessage);


        return () => {
            // Cleanup function to remove event listeners
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message", onMessage);
        };
    }, []);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        callFunction(number);
    };

    const callFunction = (num: string) => {
        console.log(`Number submitted: ${num}`);
        socket.emit("join", num);
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <h1 className="text-4xl font-bold text-orange-500">Join Code</h1>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                <label className="text-lg font-medium">
                    <input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded-full text-black appearance-none"
                        placeholder="Join Code"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit(e);
                            }
                        }}
                    />
                </label>
                <button type="submit" className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#FF5900] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default JoinPage;