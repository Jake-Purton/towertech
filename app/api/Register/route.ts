import { NextResponse } from "next/server";
import fs from "fs";

interface User {
  name: string;
  email: string;
  password: string;
}

export async function POST(req: Request) {
  try {

    const body = await req.json() as User;
    const { name, email, password } = body;

    // Fetch existing users from database
    const users = sql_fetch();

    // Check for duplicate email
    if (users.some(user => user.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password and add new user
    const hashedPassword = hash_password(password);
    const newUser: User = { name, email, password: hashedPassword };
    users.push(newUser);

    // Save users to database
    put_users_in_db(users);

    console.log("✅ User registered successfully");
    return NextResponse.json({ message: "Registration successful" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

function hash_password(password: string): string {
  return "blah" + password; // Replace with actual hashing function
}

function sql_fetch(): User[] {
  return [{ name: "jake", email: "jake@gmail.com", password: "blahpassword" }]; // Replace with actual SQL query
}

function put_users_in_db(users: User[]) {
  // Replace with actual SQL query
}
function validate_email(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function validate_password(password: string): boolean {
  return true; // Replace with actual password validation
}

function check_password(password: string, hashedPassword: string): boolean {
  return hashedPassword === hash_password(password); // replace this with actual password check
}

// Add login handler in the same file
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }


    if (!validate_email(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!validate_password(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    //check if database exists

    const users: User[] = sql_fetch();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = check_password(password, user.password);
    
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