import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Package, Home, ArrowRight } from 'lucide-react'

const OrderSuccess = () => {
  const location = useLocation()
  const orderId = location.state?.orderId

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Success Animation */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for choosing FreshWash. Your order has been confirmed and will be processed soon.
          </p>

          {orderId && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-xl font-bold text-primary-600">
                #{orderId.slice(-8)}
              </p>
            </div>
          )}

          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4 text-left">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">What's Next?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• We'll pick up your items within 24 hours</li>
                  <li>• Your clothes will be professionally cleaned</li>
                  <li>• We'll deliver them back fresh and clean</li>
                  <li>• Track your order in the dashboard</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You'll receive an email confirmation shortly with your order details.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>Track Your Order</span>
            </Link>

            <Link
              to="/"
              className="w-full btn-outline flex items-center justify-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help with your order?</p>
          <Link
            to="/contact"
            className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-1"
          >
            <span>Contact Support</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Why Choose FreshWash?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Free pickup and delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">24-48 hour turnaround time</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">100% satisfaction guarantee</span>
            </div>
            <div className="flex items-center space-x-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Eco-friendly cleaning products</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
