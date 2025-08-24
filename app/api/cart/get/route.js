// app/api/cart/get/route.js

import connectDB from "@/config/db";
import User from "@/models/User";
// FIX: Corrected the import path for getAuth
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();
        const { userId } = getAuth(request);

        // Add a check for unauthenticated users
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await User.findById(userId);

        // Add a check in case the user exists in Clerk but not in your database
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, cartItems: user.cartItems });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}