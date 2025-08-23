import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// ✅ FIX: Updated to the modern, single-object syntax for clarity and best practice.
export const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            imageUrl: image_url
        };

        await connectDB();
        await User.create(userData);
    }
);

// ✅ FIX: Updated to the modern syntax.
export const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData = {
            email: email_addresses[0].email_address,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            imageUrl: image_url
        };

        await connectDB();
        await User.findByIdAndUpdate(id, userData);
    }
);

// ✅ FIX: Updated to the modern syntax.
export const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk' },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        const { id } = event.data;
        
        if (!id) {
            console.log("Skipping deletion, ID is missing from event data.");
            return;
        }

        await connectDB();
        await User.findByIdAndDelete(id);
    }
);

// ✅ FIX: Updated to the modern syntax and corrected the batch processing logic.
export const createUserOrder = inngest.createFunction(
    {
        id: 'create-user-order',
        batchEvents: {
            maxSize: 5,
            timeout: '5s'
        }
    },
    { event: 'order/created' },
    async ({ events }) => { // The argument is 'events' (plural) for batching
        
        // ✅ CRITICAL FIX: Use .map() on the 'events' array to transform each event into an order object.
        const orders = events.map((event) => {
            return {
                userId: event.data.userId,
                items: event.data.items,
                amount: event.data.amount,
                address: event.data.address,
                // Use a default date if not provided in the event
                date: event.data.date || new Date() 
            };
        });

        if (orders.length === 0) {
            return { success: true, message: "No orders to process." };
        }

        await connectDB();
        await Order.insertMany(orders);

        return { success: true, processed: orders.length };
    }
);
