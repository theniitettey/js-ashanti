
import { auth } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma'; // Correct path relative to backend/prisma/
import dotenv from 'dotenv';
// import { headers } from 'next/headers'; // Removed for Node compatibility

dotenv.config();

async function main() {
    console.log("Checking for existing users...");
    const existingUser = await prisma.user.findFirst({
        where: { email: "admin@example.com" }
    });

    if (existingUser) {
        console.log("Admin user already exists.");
        console.log("Email: admin@example.com");
        console.log("If you forgot the password, you may need to delete this user from the database directly.");
        return;
    }

    console.log("Creating admin user...");

    // We can't easily use auth.api.signUpEmail without a request context in some versions of better-auth
    // or it requires a mock request.
    // However, better-auth exposes utilities usually.

    // Let's try to purely use Prisma but we need the password hash.
    // Since we can't easily access the internal hash function of better-auth from here without digging,
    // we will try to use the auth.api if possible, or fallback to a known hash if we can.

    // Actually, better-auth has a `api` property that exposes the actions. 
    // They usually require a passed context or it mocks it.

    try {
        const res = await auth.api.signUpEmail({
            body: {
                email: "admin@example.com",
                password: "password123",
                name: "Admin User"
            }
        });

        if (res) {
            console.log("User created via Better Auth.");
            // Now promote to admin
            const user = await prisma.user.update({
                where: { email: "admin@example.com" },
                data: { role: "admin" }
            });
            console.log("User promoted to admin.");
            console.log("Credentials:");
            console.log("Email: admin@example.com");
            console.log("Password: password123");
        }
    } catch (e) {
        console.error("Failed to create user using auth.api:", e);
        console.log("Attempting manual seed (this might fail if password hashing doesn't match)...");
        // Fallback or just report error
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
