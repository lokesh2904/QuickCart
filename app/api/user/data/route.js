 import { NextResponse } from "next/server";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";

export async function GET(request) {
    try {
        const { userId } = getAuth(request);

        // ✅ 1. Check for authentication first.
        // If there's no userId, the user is not logged in.
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 } // ✅ Set status to 401
            );
        }

        await connectDB();
        const user = await User.findById(userId);

        // ✅ 2. Handle the case where the user is authenticated but not in the DB.
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User Not Found" },
                { status: 404 } // ✅ Set status to 404
            );
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        // ✅ 3. Handle unexpected server errors.
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 } // ✅ Set status to 500
        );
    }
}