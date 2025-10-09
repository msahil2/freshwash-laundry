import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, MapPin, CreditCard, CheckCircle } from 'lucide-react'
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

  // Payment card state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  const [cardErrors, setCardErrors] = useState({})

  const taxAmount = total * 0.1
  const finalTotal = total + taxAmount

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const parts = []
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4))
    }
    return parts.join(' ').substring(0, 19)
  }

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleCardInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value)
    } else if (name === 'expiryDate') {
      formattedValue = formatExpiry(value)
      if (formattedValue.length > 5) return
    } else if (name === 'cvv') {
      if (value.length > 3 || !/^\d*$/.test(value)) return
      formattedValue = value
    }

    setCardDetails({ ...cardDetails, [name]: formattedValue })
    
    // Clear error for this field
    if (cardErrors[name]) {
      setCardErrors({ ...cardErrors, [name]: '' })
    }
  }

  const validateCardDetails = () => {
    const errors = {}

    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Card number must be 16 digits'
    }

    if (!cardDetails.cardName || cardDetails.cardName.length < 3) {
      errors.cardName = 'Cardholder name is required'
    }

    if (!cardDetails.expiryDate || cardDetails.expiryDate.length !== 5) {
      errors.expiryDate = 'Valid expiry date required (MM/YY)'
    } else {
      const [month, year] = cardDetails.expiryDate.split('/')
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiryDate = 'Invalid month'
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiryDate = 'Card has expired'
      }
    }

    if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
      errors.cvv = '3-digit CVV required'
    }

    setCardErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateShippingAddress = () => {
    if (!shippingAddress.name || !shippingAddress.phone || 
        !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      toast.error('Please fill all required address fields')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!validateShippingAddress()) {
      return
    }

    if (!validateCardDetails()) {
      toast.error('Please check your card details')
      return
    }

    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Create order with demo payment
      const orderData = {
        orderItems: items.map(item => ({
          service: item.service._id || item.service,
          serviceType: item.serviceType || item.type || 'standard',
          quantity: item.quantity || 1,
          price: item.price || 0,
          subtotal: item.subtotal || item.price * item.quantity
        })),
        shippingAddress: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          instructions: shippingAddress.instructions || ''
        },
        paymentMethod: 'stripe',
        itemsPrice: total,
        shippingPrice: 0,
        taxPrice: taxAmount,
        totalPrice: finalTotal,
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: 'DEMO_' + Date.now(),
          status: 'succeeded',
          update_time: new Date().toISOString(),
          email_address: user?.email || '',
          cardLast4: cardDetails.cardNumber.replace(/\s/g, '').slice(-4),
          isDemoMode: true
        }
      }

      console.log('Sending order data:', orderData) // Debug log

      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Clear cart and show success
      clearCart()
      toast.success('Payment Successful! Order placed.')
      navigate('/orderSuccess', { 
        state: { 
          orderId: orderResponse.data.order?._id || orderResponse.data._id
        } 
      })

    } catch (error) {
      console.error('Checkout error:', error)
      console.error('Error response:', error.response?.data) // Debug log
      toast.error(error.response?.data?.message || 'Order creation failed. Please try again.')
    } finally {
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

                <form className="space-y-4">
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
                      placeholder="House no., Building name"
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
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardInputChange}
                      className={`input-field ${cardErrors.cardNumber ? 'border-red-500' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                    {cardErrors.cardNumber && (
                      <p className="text-red-500 text-xs mt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={cardDetails.cardName}
                      onChange={handleCardInputChange}
                      className={`input-field ${cardErrors.cardName ? 'border-red-500' : ''}`}
                      placeholder="Name on card"
                    />
                    {cardErrors.cardName && (
                      <p className="text-red-500 text-xs mt-1">{cardErrors.cardName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardInputChange}
                        className={`input-field ${cardErrors.expiryDate ? 'border-red-500' : ''}`}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {cardErrors.expiryDate && (
                        <p className="text-red-500 text-xs mt-1">{cardErrors.expiryDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardInputChange}
                        className={`input-field ${cardErrors.cvv ? 'border-red-500' : ''}`}
                        placeholder="123"
                        maxLength="3"
                      />
                      {cardErrors.cvv && (
                        <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-2">
                    <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">🎭 Demo Mode Active</p>
                      <p>Use any valid card format for testing</p>
                      <p className="font-mono text-xs mt-1">Example: 4242 4242 4242 4242</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.service.name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(item.subtotal)}</span>
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
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pay Now</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to our Terms & Conditions
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