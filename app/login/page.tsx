"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessageType('error');
      setMessage("Please fill in all fields!");
      return;
    }
    
    setLoading(true);
  
    try {
      const res = await fetch(`/api/Register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
        method: "GET"
      });
  
      const data = await res.json();
      
      if (res.ok) {
        setMessageType('success');
        setMessage("Welcome back! Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else if (res.status === 404) {
        setMessageType('error');
        setMessage("Email not found. Please register first.");
      } else if (res.status === 401) {
        setMessageType('error');
        setMessage("Invalid password. Please try again.");
      } else {
        setMessageType('error');
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">Login</h1>
        
        {message && (
          <div className={`mb-4 text-center ${
            messageType === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-black"
            autoFocus
          />
          
          <input
            type={showPassword ? "text" : "password"}
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

        <div className="mt-4 text-center"></div>
          <p>
            Don't have an account?{" "}
            <a href="/register" className="text-orange-400 underline">
              Register
            </a>
          </p>
        </div>
      </div>
  );
}