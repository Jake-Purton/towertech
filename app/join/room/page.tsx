"use client";

import React, { useState, useEffect } from 'react';
import { socket } from "../../src/socket";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const JoinRoomPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [inRoom, setInRoom] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  type User = { userID: string, username: string };
  const searchParams = useSearchParams();
  const username = searchParams?.get('username');

  console.log(username)
  
  useEffect(() => {
    // Listen for updates to the user list
    socket.on('updateUsers', (userList) => {
      setIsLoading(false);
      if (userList.length === 0) {
        setInRoom(false)
      }
      setUsers(userList);
    });
    socket.on("gameStarted", () =>{
      // route to a different page
      router.push("/game_controller");
    });

    socket.on("You have been ejected", () => {
      router.push("/join")
    });

    socket.emit('getUsers');

    // Clean up the socket connection on component unmount
    return () => {
      socket.off('updateUsers');
      socket.off("gameStarted");
      socket.off("You have been ejected")
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
      {isLoading ? (
        <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Loading...</h1>
      ) : (
      <>
        {inRoom ? (
        <>
          <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Successfully joined room</h1>
          <table className="min-w-[50%] max-w-[75%] divide-y divide-gray-600 rounded-lg overflow-hidden border border-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-medium text-orange-500">
                  Joined users
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-600">
              {users.map((user, index) => (
                <tr key={index}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${user.username === username ? 'text-white' : 'text-orange-500'}`}>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
        ):(
          <>
            <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">You are not in a room</h1>
            <p><Link className="text-orange-600 hover:text-orange-700 underline" href='/join'>Join a room</Link> or <Link className="text-orange-600 hover:text-orange-700 underline" href='/'>go back to home</Link></p>
          </>
        )}
      </>
      )}

    </div>
  );
};

export default JoinRoomPage;
