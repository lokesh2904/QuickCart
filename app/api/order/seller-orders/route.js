import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User"; // FIX 1: Add missing import for the User model
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();
        const { userId } = getAuth(request);

        // FIX 2: Add a check for unauthenticated users first
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // FIX 3: Implement seller authorization logic
        // The 'authSeller' function was not defined. This is a standard way to check the user's role.
        const user = await User.findById(userId);
        if (!user || user.role !== 'seller') {
            return NextResponse.json(
                { success: false, message: "Forbidden: Not a seller" },
                { status: 403 } // 403 Forbidden is the correct status for authorization failure
            );
        }
        
        // FIX 4: Remove unnecessary/dead code
        // Address.length; // This line did nothing and has been removed.

        // FIX 5: Correct the typo in the .populate() path
        // It was 'items.producct', now it's 'items.product'.
        const orders = await Order.find({})
            .populate('address')
            .populate('items.product');

        return NextResponse.json({ success: true, orders });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}