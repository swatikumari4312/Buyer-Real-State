import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const secretKey = process.env.JWT_SECRET || "your-secret-key"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function login(email: string, password: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (user.length === 0) {
    throw new Error("Invalid credentials")
  }

  const isValid = await bcrypt.compare(password, user[0].passwordHash)
  if (!isValid) {
    throw new Error("Invalid credentials")
  }

  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({ userId: user[0].id, email: user[0].email })

  const cookieStore = await cookies()
  cookieStore.set("session", session, { expires, httpOnly: true })

  return { user: { id: user[0].id, email: user[0].email, name: user[0].name } }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.set("session", "", { expires: new Date(0) })
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value

  if (!session) return null

  try {
    const payload = await decrypt(session)
    return payload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await db.select().from(users).where(eq(users.id, session.userId)).limit(1)

  if (user.length === 0) return null

  return {
    id: user[0].id,
    email: user[0].email,
    name: user[0].name,
    role: user[0].role,
  }
}

export async function register(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (existingUser.length > 0) {
    throw new Error("User already exists")
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create user
  const newUser = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
    })
    .returning()

  return newUser[0]
}
