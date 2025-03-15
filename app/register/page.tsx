"use client"; // Required for hooks in Next.js App Router

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const router = useRouter();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill in all fields!"); 
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Invalid email format!");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessageType('success');
        setMessage(data.message);
        setTimeout(() => {
          router.push("/login"); // Redirect to login after registration
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(data.error);
      }
    } catch (error) {
      setMessageType('error');
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-900 text-white">
      <a
        href="/"
        className="absolute top-4 right-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
      >
        Back to Home
      </a>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        {message && (
          <div className={`mb-4 text-center ${
            messageType === 'success' ? 'text-green-500' : 'text-red-500'
          }`}>
            {message}
          </div>
        )}
        <h1 className="text-2xl font-bold text-center mb-6 text-orange-600">Register</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-black"
            autoFocus
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-600 rounded-lg text-black"
          />

          {/* Password Input */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg text-black pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 py-2 text-gray-600 focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg text-black pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 px-3 py-2 text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-bold transition ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-orange-400 underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
