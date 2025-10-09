import React, { useState } from 'react'
import { Star } from 'lucide-react'

const RatingStars = ({ 
  rating = 0, 
  onChange, 
  readonly = false, 
  size = 'sm',
  showValue = true 
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  }
  
  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value)
    }
  }
  
  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }
  
  const currentRating = hoverRating || rating
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${
              readonly 
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-110 transition-transform duration-150'
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= currentRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              } transition-colors duration-150`}
            />
          </button>
        ))}
      </div>
      
      {showValue && (
        <span className={`font-medium ${
          size === 'sm' ? 'text-sm' : 
          size === 'md' ? 'text-base' : 
          size === 'lg' ? 'text-lg' : 'text-xl'
        } text-gray-700`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// Static display component for showing average ratings
export const DisplayRating = ({ rating, reviewCount, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }
  
  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : star === Math.ceil(rating) && rating % 1 !== 0
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      
      <div className={`${textSizes[size]} text-gray-600`}>
        <span className="font-medium">{rating.toFixed(1)}</span>
        {reviewCount !== undefined && (
          <span className="text-gray-500 ml-1">
            ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        )}
      </div>
    </div>
  )
}

export default RatingStars