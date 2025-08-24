import connectDB from "@/config/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // 1. Connect to the database
        await connectDB();

        // 2. Find all documents in the User collection where the 'role' field is 'seller'
        const sellers = await User.find({ role: 'seller' });

        // 3. Return a successful response with the list of sellers
        return NextResponse.json({
            success: true,
            sellers: sellers
        });

    } catch (error) {
        // 4. Handle any potential server errors
        return NextResponse.json(
            { success: false, message: "Error fetching sellers" },
            { status: 500 }
        );
    }
}