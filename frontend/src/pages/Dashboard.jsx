import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, User, Mail, Phone, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/api'
import axios from 'axios'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/orders/myorders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      console.log('Orders response:', response.data)
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'confirmed':
      case 'in-progress':
        return <Package className="h-5 w-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your orders and account</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'orders'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Profile Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="loader mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <a href="/services" className="btn-primary">
                      Browse Services
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                Order #{order._id.slice(-8)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              {order.isPaid && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Paid
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">
                              {formatPrice(order.totalPrice)}
                            </p>
                            <p className="text-sm text-gray-500">{order.orderItems?.length || 0} items</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                          <div className="space-y-2">
                            {order.orderItems?.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.service?.name || 'Service'} ({item.serviceType}) × {item.quantity}
                                </span>
                                <span className="font-medium">{formatPrice(item.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">Delivery Address:</h4>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.name}<br />
                              {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                              {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        )}

                        {order.paymentResult?.isDemoMode && (
                          <div className="border-t pt-4 mt-4">
                            <p className="text-xs text-blue-600 flex items-center">
                              <span className="mr-1">🎭</span> Demo Payment Mode
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="input-field bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="input-field bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        readOnly
                        className="input-field bg-gray-50"
                      />
                    </div>

                    {user?.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Address
                        </label>
                        <textarea
                          value={`${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.zipCode}`}
                          readOnly
                          rows="3"
                          className="input-field bg-gray-50"
                        />
                      </div>
                    )}

                    <div className="pt-4">
                      <p className="text-sm text-gray-500">
                        To update your profile information, please contact our support team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard