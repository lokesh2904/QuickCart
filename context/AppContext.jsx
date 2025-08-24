'use client'
import { productsDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
// 1. Import useMemo for performance optimization
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY
    const router = useRouter()

    const { user } = useUser()
    const { getToken } = useAuth()

    const [products, setProducts] = useState([])
    const [userData, setUserData] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState({})

    const fetchProductData = async () => {
        try {
            const { data } = await axios.get('/api/product/list')
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUserData = async () => {
        try {
            if (user?.publicMetadata?.role === 'seller') {
                setIsSeller(true)
            }
            const token = await getToken()
            const { data } = await axios.get('/api/user/data', { headers: { Authorization: `Bearer ${token}` } })
            
            if (data.success) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const addToCart = async (itemId) => {
        // --- RELIABILITY FIX ---
        // Save the original state in case the API call fails
        const originalCart = structuredClone(cartItems);

        // Optimistically update the UI
        const newCart = structuredClone(cartItems);
        newCart[itemId] = (newCart[itemId] || 0) + 1;
        setCartItems(newCart);
        
        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData: newCart }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Item added to cart')
            } catch (error) {
                toast.error("Failed to add item. Reverting change.");
                // If the API fails, revert the state to the original
                setCartItems(originalCart);
            }
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        // --- RELIABILITY FIX ---
        const originalCart = structuredClone(cartItems);

        // Optimistically update the UI
        const newCart = structuredClone(cartItems);
        if (quantity === 0) {
            delete newCart[itemId];
        } else {
            newCart[itemId] = quantity;
        }
        setCartItems(newCart)

        if (user) {
            try {
                const token = await getToken()
                await axios.post('/api/cart/update', { cartData: newCart }, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Cart Updated')
            } catch (error) {
                toast.error("Failed to update cart. Reverting change.");
                // If the API fails, revert the state to the original
                setCartItems(originalCart);
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (itemInfo && cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    useEffect(() => {
        fetchProductData()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    // --- PERFORMANCE FIX ---
    // 2. Memoize the context value to prevent unnecessary re-renders
    // This value object will only be recreated if one of the dependencies changes.
    const value = useMemo(() => ({
        user, getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }), [products, userData, cartItems, isSeller, user]);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}