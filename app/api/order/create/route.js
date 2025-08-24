import connectDB from "@/config/db";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";
import Product from "@/models/Product"; // FIX 1: Add missing import for the Product model
import { inngest } from "@/config/inngest";

export async function POST(request) {
    try {
        // FIX 2: Connect to the database
        await connectDB();

        const { userId } = getAuth(request);
        const { address, items } = await request.json();

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
        }

        // --- FIX 3: Correctly calculate the total amount ---
        // Using an async function with .reduce() does not work as expected.
        // A for...of loop is the correct and clearest way to handle this.
        let totalAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                totalAmount += product.offerPrice * item.quantity;
            }
        }

        const finalAmount = totalAmount + Math.floor(totalAmount * 0.02);

        // Send an event to Inngest to process the order asynchronously
        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                amount: finalAmount,
                date: Date.now()
            }
        });

        // Clear the user's cart
        const user = await User.findById(userId);
        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: 'Order Placed' });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}