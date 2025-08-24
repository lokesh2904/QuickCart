// app/api/user/add-address/route.js

import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB();
        // FIX 1: Pass the 'request' object to getAuth
        const { userId } = getAuth(request);
        const { address } = await request.json();

        // FIX 2: Add validation for authentication and input
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        if (!address) {
            return NextResponse.json({ success: false, message: "Address data is required" }, { status: 400 });
        }

        const newAddress = await Address.create({ ...address, userId });
        
        return NextResponse.json({ success: true, message: "Address added successfully", address: newAddress });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}