import React, { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

const initialState = {
  items: [],
  total: 0,
  isOpen: false
}

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { service, serviceType, quantity = 1 } = action.payload
      const existingItemIndex = state.items.findIndex(
        item => item.service._id === service._id && item.serviceType === serviceType
      )

      let updatedItems
      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const newItem = {
          id: `${service._id}-${serviceType}`,
          service,
          serviceType,
          quantity,
          price: service.services[serviceType].price,
          subtotal: service.services[serviceType].price * quantity
        }
        updatedItems = [...state.items, newItem]
      }

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.id !== action.payload)
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        const updatedItems = state.items.filter(item => item.id !== id)
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems)
        }
      }

      const updatedItems = state.items.map(item =>
        item.id === id
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0
      }

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      }

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload
      }

    case 'LOAD_CART':
      const loadedItems = action.payload || []
      return {
        ...state,
        items: loadedItems,
        total: calculateTotal(loadedItems)
      }

    default:
      return state
  }
}

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.subtotal, 0)
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartData })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (service, serviceType, quantity = 1) => {
    if (!service.services[serviceType]?.available) {
      toast.error(`${serviceType} service is not available for this item`)
      return
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { service, serviceType, quantity }
    })

    toast.success(`Added ${service.name} (${serviceType}) to cart`)
  }

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
    toast.success('Item removed from cart')
  }

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Cart cleared')
  }

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' })
  }

  const setCartOpen = (isOpen) => {
    dispatch({ type: 'SET_CART_OPEN', payload: isOpen })
  }

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const getItemInCart = (serviceId, serviceType) => {
    return state.items.find(
      item => item.service._id === serviceId && item.serviceType === serviceType
    )
  }

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    getCartCount,
    getItemInCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext