"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await fetch(`/api/Register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "GET"
      });
  
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Welcome back! Login successful!");
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          router.push("/main");
        }, 1500);
      } else if (res.status === 404) {
        setMessage("Email not found. Please register first.");
      } else if (res.status === 401) {
        setMessage("Invalid password. Please try again.");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">Login</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <p className="text-red-500 text-center">{message}</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-black"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-black"
          />
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <a href="/Register" className="text-orange-400 underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}