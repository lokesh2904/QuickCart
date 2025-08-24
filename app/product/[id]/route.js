import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { productId } = params;

        // Find the product by its ID in the database
        const product = await Product.findById(productId);

        // If no product is found, return a 404 error
        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product: product });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Error fetching product" },
            { status: 500 }
        );
    }
}