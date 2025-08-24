import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(request) {
    try {
        await connectDB();
        const { userId } = getAuth(request);
        const { cartData } = await request.json();

        // FIX 1: Add a check for unauthenticated users
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);

        // FIX 2: Add a check in case the user does not exist in your database
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        user.cartItems = cartData;
        await user.save();
        
        return NextResponse.json({ success: true, message: "Cart updated" });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 } // Add a 500 status for server errors
        );
    }
}