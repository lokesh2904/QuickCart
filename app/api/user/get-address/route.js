// app/api/user/get-address/route.js

import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();
        // FIX 1: Pass the 'request' object to getAuth
        const { userId } = getAuth(request);

        // FIX 2: Add validation for authentication
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const addresses = await Address.find({ userId });
        
        // FIX 3: Return the correct variable name ('addresses')
        return NextResponse.json({ success: true, addresses: addresses });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}