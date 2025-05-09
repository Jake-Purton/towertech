"use client";

import { useEffect, useState, Suspense } from "react";
import { socket } from "../src/socket";
import { JoinRoomMessage } from "../src/messages";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";

async function verifyToken(token: string) {
    try {
        const res = await fetch("/api/checkToken", {
            method: "POST",
            headers: {
                "Content-Type": "application/json", 
            },
            body: JSON.stringify({ token }),
      });
  
      const data = await res.json();
      return data.valid;
    } catch (error) {
        console.error("Token verification failed:", error);
        return false;
    }
}

const JoinPageContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({ name: "", email: "" });
    const [number, setNumber] = useState('');
    const [message, setMessage] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    useEffect(() => {
        if (searchParams) {
            const roomCode = searchParams.get('roomCode');
            if (roomCode) {
                setNumber(roomCode);
            }
        }

        const checkToken = async () => {
            const token = localStorage.getItem("token");
            const user = localStorage.getItem("user");

            if (user) {
                setUser(JSON.parse(user));
                setUsername(JSON.parse(user).name);
            }
            if (token && await verifyToken(token)) {
                setIsLoggedIn(true);
            }
            setIsLoading(false);
        };
      
        checkToken();
        
        function onMessage(msg: string) {
            setMessage(msg);
            console.log(msg);
        }

        function onRoomErr(err: string) {
            setMessage(err);
            setIsSubmitted(false);
        }

        function onSuccess(data) {
            localStorage.setItem("indexToken", data.token)
            router.push(`/join/room?username=${data.username}`);
        }

        socket.on("message", onMessage);
        socket.on("RoomErr", onRoomErr);
        socket.on("roomJoinSuccess", onSuccess);

        return () => {
            // Cleanup function to remove event listeners
            socket.off("message", onMessage);
            socket.off("RoomErr", onRoomErr);
            socket.off("roomJoinSuccess", onSuccess);
        };
    }, [searchParams]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (number === "") {
            setMessage("Please enter a join code");
            return;
        }
        if (!isLoggedIn && username === "") {
            setMessage("Please enter a username");
            return;
        }

        if (!isLoggedIn && username.length >= 20) {
            setMessage("Username too long (username should be fewer than 20 characters)");
            return;
        }

        console.log("Joining room with code:", number, username.trim(), isLoggedIn);

        
        localStorage.setItem('player_username', username.trim())

        if (!isLoggedIn) {
            dataSender(number, username.trim());
        } else {
            const token = localStorage.getItem("token");
            if (token) {
                dataSenderAuthenticated(number, token);
            }
        }
        setIsSubmitted(true);
    };

    const dataSenderAuthenticated = (code: string, token: string) => {
        if (socket.id) {
            const join_message = { userId: socket.id, roomCode: code, token };
            socket.emit("joinRoomAuthenticated", join_message);
        } else {
            setMessage("Socket ID is undefined");
        }
    };

    const dataSender = (code: string, username: string) => {
        if (socket.id) {
            const join_message = new JoinRoomMessage(socket.id, code, username);
            socket.emit("JOIN_ROOM", join_message);
        } else {
            setMessage("Socket ID is undefined");
        }

    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
            <Link
                href="/"
                className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
            >
                Back to Home
            </Link>
            {!isLoading && (
                <div className="absolute top-4 left-4 flex gap-4">
                {isLoggedIn ? (
                    <>
                    <p>Signed in as {user.name}.</p>
                    <button
                        onClick={handleLogout}
                        className="text-orange-600 hover:text-orange-700 underline"
                    >
                        Sign out?
                    </button>
                    </>
                ) : (
                    <ul>
                    <li>
                        <Link href="/login" className="text-orange-600 hover:text-orange-700 underline">
                            Login
                        </Link>
                    </li> 
                    <li>
                        <Link href="/register" className="text-orange-600 hover:text-orange-700 underline">
                            Register
                        </Link>
                    </li>
                    </ul>
                )}
                </div>
            )}
            <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Join Code</h1>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
                <label className="text-lg font-medium w-full">
                    <p className="text-red-500 text-center">{message}</p>
                    {!isLoggedIn && (
                        <>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-2 p-2 border border-gray-600 rounded-full text-black appearance-none w-full"
                                placeholder="Username"
                            />
                            <br />
                        </>
                    )}
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
                <button
                    type="submit"
                    className={`mt-6 px-4 py-2 rounded-lg shadow-md transition-all ${
                        isSubmitted ? "bg-gray-600 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
                    } text-white`}
                    disabled={isSubmitted}
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

const JoinPage: React.FC = () => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <JoinPageContent />
        </Suspense>
    );
};

export default JoinPage;