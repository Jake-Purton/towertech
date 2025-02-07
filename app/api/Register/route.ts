import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

interface User {
  name: string;
  email: string;
  password: string;
}

// Define paths
const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

export async function POST(req: Request) {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Create users.json if it doesn't exist
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, "[]", "utf-8");
    }

    const body = await req.json() as User;
    const { name, email, password } = body;

    // Read existing users
    const users: User[] = JSON.parse(fs.readFileSync(usersFile, "utf-8"));

    // Check for duplicate email
    if (users.some(user => user.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password and add new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = { name, email, password: hashedPassword };
    users.push(newUser);

    // Write updated users to file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log("✅ User registered successfully");
    return NextResponse.json({ message: "Registration successful" }, { status: 201 });
  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

// Add login handler in the same file
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (!fs.existsSync(usersFile)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const users: User[] = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password!, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ 
      message: "Login successful",
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}