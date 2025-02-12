import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sql } from "@vercel/postgres";


const JWT_SECRET = process.env.NEXT_PRIVATE_JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ JWT secret is not set (check readme for adding secrets)");
}

interface User {
  name: string;
  email: string;
  // the password is stored as a hash
  password: string;
}

export async function POST(req: Request) {
  try {

    const body = await req.json() as User;
    const { name, email, password } = body;

    // Fetch existing users from database
    const users = sql_fetch();

    // Check for duplicate email
    if ((await users).some(user => user.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    if (!validate_email(email)) {    
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!validate_password(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // Hash password and add new user
    const hashedPassword = hash_password(password);
    const newUser: User = { name, email, password: hashedPassword };
    (await users).push(newUser);

    // Save users to database
    put_users_in_db(newUser);

    console.log("✅ User registered successfully");
    return NextResponse.json({ message: "Registration successful" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error during registration:", error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

function hash_password(password: string): string {
  return bcrypt.hashSync(password, 10);
}

async function sql_fetch(): Promise<User[]> {
  const result = await sql`SELECT * FROM users;`;
  return result.rows.map(row => ({
    name: row.name,
    email: row.email,
    password: row.password
  }));
}

async function put_users_in_db(newUser: User) {
  const abde = await sql`INSERT INTO users (name, email, password) VALUES (${newUser.name}, ${newUser.email}, ${newUser.password});`;
}
function validate_email(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function validate_password(password: string): boolean {
  return true; // Replace with actual password validation
  // make sure it is more than 6 characters...
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

    //check if database exists

    const users: User[] = await sql_fetch();
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({ 
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}