import React, { useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice, getServiceTypeDisplayName } from '../utils/api'

const ServiceCard = ({ service }) => {
  const [selectedService, setSelectedService] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { addToCart, getItemInCart } = useCart()

  const availableServices = Object.entries(service.services)
    .filter(([_, serviceData]) => serviceData.available)
    .map(([type, serviceData]) => ({ type, ...serviceData }))

  const handleAddToCart = () => {
    if (!selectedService) return
    
    addToCart(service, selectedService, quantity)
    setQuantity(1)
  }

  const selectedServiceData = service.services[selectedService]
  const itemInCart = selectedService ? getItemInCart(service._id, selectedService) : null

  return (
    <div className="card group hover:shadow-xl transition-all duration-300">
      {/* Service Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={service.image || '/images/default-service.jpg'}
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/images/default-service.jpg'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Service Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
            {service.category}
          </span>
        </div>

        {/* Service Types */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Available Services:</h4>
          <div className="grid grid-cols-1 gap-2">
            {availableServices.map(({ type, price }) => (
              <label
                key={type}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedService === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={`service-${service._id}`}
                    value={type}
                    checked={selectedService === type}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {getServiceTypeDisplayName(type)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(price)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        {selectedService && (
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-lg text-gray-900">
                {formatPrice(selectedServiceData.price * quantity)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>

            {itemInCart && (
              <div className="text-center">
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {itemInCart.quantity} in cart
                </span>
              </div>
            )}
          </div>
        )}

        {availableServices.length === 0 && (
          <div className="text-center py-4">
            <span className="text-sm text-gray-500">No services available</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceCard