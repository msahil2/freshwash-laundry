import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, MapPin, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/api'
import axios from 'axios'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    instructions: ''
  })

  const taxAmount = total * 0.1
  const finalTotal = total + taxAmount

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const validateAddress = () => {
    if (!shippingAddress.name) {
      toast.error('Please enter your name')
      return false
    }
    if (!shippingAddress.phone) {
      toast.error('Please enter your phone number')
      return false
    }
    if (!shippingAddress.street) {
      toast.error('Please enter your street address')
      return false
    }
    if (!shippingAddress.city) {
      toast.error('Please enter your city')
      return false
    }
    if (!shippingAddress.state) {
      toast.error('Please enter your state')
      return false
    }
    if (!shippingAddress.zipCode) {
      toast.error('Please enter your ZIP code')
      return false
    }
    return true
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateAddress()) return
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      // Step 1: Create order in database first
      const orderData = {
        orderItems: items.map(item => ({
          service: item.service._id,
          serviceType: item.serviceType,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        shippingAddress,
        paymentMethod: 'razorpay',
        itemsPrice: total,
        shippingPrice: 0,
        taxPrice: taxAmount,
        totalPrice: finalTotal
      }

      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        orderData
      )

      const createdOrderId = orderResponse.data.order._id

      // Step 2: Create Razorpay payment order
      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
        { amount: finalTotal }
      )

      const { orderId: razorpayOrderId, keyId } = paymentResponse.data

      // Step 3: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Please try again.')
        setLoading(false)
        return
      }

      // Step 4: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'FreshWash Laundry',
        description: 'Laundry Service Payment',
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || shippingAddress.name,
          email: user?.email || '',
          contact: shippingAddress.phone
        },
        notes: {
          orderId: createdOrderId
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response) => {
          try {
            // Step 5: Verify payment on backend
            await axios.post(
              `${import.meta.env.VITE_API_URL}/api/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: createdOrderId
              }
            )

            clearCart()
            toast.success('Payment successful! Order placed.')
            navigate('/order-success', {
              state: { orderId: createdOrderId }
            })
          } catch (error) {
            toast.error('Payment verification failed. Contact support.')
            console.error('Verification error:', error)
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled')
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setLoading(false)

    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(
        error.response?.data?.message || 'Checkout failed. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold">Delivery Address</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={shippingAddress.name}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingAddress.street}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="House no., Building name, Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      name="instructions"
                      value={shippingAddress.instructions}
                      onChange={handleInputChange}
                      rows="3"
                      className="input-field"
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold">Payment</h2>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Secure Payment via Razorpay
                  </p>
                  <p className="text-sm text-blue-700">
                    Supports UPI, Credit/Debit Cards, Net Banking, and Wallets.
                    You will be redirected to Razorpay secure payment page.
                  </p>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <img
                    src="https://razorpay.com/favicon.png"
                    alt="Razorpay"
                    className="h-6"
                  />
                  <span className="text-sm text-gray-600">
                    Secured by Razorpay
                  </span>
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.service.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 10%)</span>
                    <span className="font-medium">{formatPrice(taxAmount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="loader"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pay {formatPrice(finalTotal)}</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout