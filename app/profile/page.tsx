"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = localStorage.getItem("user");
      if (user) {
        setUser(JSON.parse(user));
        setNewUsername(JSON.parse(user).name);
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to update your username.");
      return;
    }

    try {
      const res = await fetch("/api/profileData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, username: newUsername }),
      });

      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
      } else {
        setUser((prevUser) => ({ ...prevUser, name: newUsername }));
        localStorage.setItem("user", JSON.stringify({ ...user, name: newUsername }));
        setIsEditing(false);
        setMessage("Username updated successfully.");
      }
    } catch (error) {
      setMessage("An error occurred while updating the username.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white sm:p-20">
        <a
            href="/"
            className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
        >
            Back to Home
        </a>
      {!isLoading && (
        <div className="absolute top-4 left-4 flex gap-4">
          {user.name ? (
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
            <a href="/login" className="text-orange-600 hover:text-orange-700 underline">
              Login
            </a>
          )}
        </div>
      )}
      <div className="flex flex-col items-center gap-4 mt-10 bg-gray-800 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h1 className="text-4xl font-bold text-orange-600 drop-shadow-md">Profile</h1>
        {user.name ? (
          <div className="text-lg">
            <p>
              <strong>Name:</strong> {isEditing ? (
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="mt-2 p-2 border border-gray-600 rounded-full text-black appearance-none w-full"
                />
              ) : (
                <>
                  {user.name}
                  <span
                    onClick={handleEdit}
                    className="ml-2 text-orange-600 hover:text-orange-700 cursor-pointer underline"
                  >
                    Edit
                  </span>
                </>
              )}
            </p>
            <p><strong>Email:</strong> {user.email}</p>
            {isEditing && (
              <button
                onClick={handleSave}
                className="mt-6 px-4 py-2 rounded-lg shadow-md transition-all bg-orange-600 hover:bg-orange-700 text-white"
              >
                Save
              </button>
            )}
          </div>
        ) : (
          <p>Please log in to view your profile.</p>
        )}
        {user.name && (
          <button
            onClick={handleLogout}
            className="mt-6 px-4 py-2 rounded-lg shadow-md transition-all bg-orange-600 hover:bg-orange-700 text-white"
          >
            Logout
          </button>
        )}
        {message && <p className="text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
