import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();
        
        // FIX: Changed variable name from 'Products' to 'products'
        const products = await Product.find({});
        
        // Now the variable 'products' correctly matches the key in the response object
        return NextResponse.json({ success: true, products });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 } // IMPROVEMENT: Add a status code for server errors
        );
    }
}