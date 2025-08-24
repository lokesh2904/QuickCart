'use client'
import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext'
import Image from 'next/image'
import { useEffect } from 'react'

const OrderPlaced = () => {

  const { router } = useAppContext()

  useEffect(() => {
    // Set up the timer
    const timer = setTimeout(() => {
      router.push('/my-orders')
    }, 5000)

    // --- FIX: Add a cleanup function ---
    // This function will run when the component is unmounted (e.g., user clicks a link)
    // It clears the timer to prevent it from running in the background.
    return () => clearTimeout(timer);
  }, [router]) // Add router as a dependency

  return (
    <div className='h-screen flex flex-col justify-center items-center gap-5'>
      <div className="flex justify-center items-center relative">
        <Image className="absolute p-5" src={assets.checkmark} alt='Checkmark icon' />
        <div className="animate-spin rounded-full h-24 w-24 border-4 border-t-green-300 border-gray-200"></div>
      </div>
      <div className="text-center text-2xl font-semibold">Order Placed Successfully</div>
    </div>
  )
}

export default OrderPlaced