import React, { useState, useEffect } from 'react'
import { Star, ThumbsUp, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { feedbackAPI } from '../utils/api'
import RatingStars, { DisplayRating } from '../components/RatingStars'
import toast from 'react-hot-toast'

const Feedback = () => {
  const { isAuthenticated, user } = useAuth()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    serviceQuality: 5,
    deliverySpeed: 5,
    valueForMoney: 5,
    wouldRecommend: true
  })

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  const fetchFeedbacks = async () => {
    try {
      const response = await feedbackAPI.getAll()
      setFeedbacks(response.data.feedback)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please login to submit feedback')
      return
    }

    setSubmitting(true)

    try {
      await feedbackAPI.create(formData)
      toast.success('Thank you for your feedback!')
      setFormData({
        rating: 5,
        comment: '',
        serviceQuality: 5,
        deliverySpeed: 5,
        valueForMoney: 5,
        wouldRecommend: true
      })
      setShowForm(false)
      fetchFeedbacks()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold mb-4">Customer Feedback</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Your opinion matters! Share your experience and help us improve.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Add Feedback Button */}
        {isAuthenticated && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>{showForm ? 'Cancel' : 'Write a Review'}</span>
            </button>
          </div>
        )}

        {/* Feedback Form */}
        {showForm && isAuthenticated && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Your Experience</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Overall Rating *
                  </label>
                  <RatingStars
                    rating={formData.rating}
                    onChange={(value) => setFormData({ ...formData, rating: value })}
                    size="lg"
                    showValue={true}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Quality
                    </label>
                    <RatingStars
                      rating={formData.serviceQuality}
                      onChange={(value) => setFormData({ ...formData, serviceQuality: value })}
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Speed
                    </label>
                    <RatingStars
                      rating={formData.deliverySpeed}
                      onChange={(value) => setFormData({ ...formData, deliverySpeed: value })}
                      size="md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value for Money
                    </label>
                    <RatingStars
                      rating={formData.valueForMoney}
                      onChange={(value) => setFormData({ ...formData, valueForMoney: value })}
                      size="md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    required
                    rows="5"
                    className="input-field"
                    placeholder="Tell us about your experience with our service..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="recommend"
                    checked={formData.wouldRecommend}
                    onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="recommend" className="text-sm text-gray-700">
                    I would recommend FreshWash to others
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="loader"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            What Our Customers Say
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="loader mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-lg">
                          {feedback.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {feedback.user?.name || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <DisplayRating rating={feedback.rating} size="sm" />
                  </div>

                  <p className="text-gray-700 mb-4 italic">"{feedback.comment}"</p>

                  {(feedback.serviceQuality || feedback.deliverySpeed || feedback.valueForMoney) && (
                    <div className="border-t pt-4 grid grid-cols-3 gap-4 text-center">
                      {feedback.serviceQuality && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Quality</p>
                          <p className="font-semibold text-sm">{feedback.serviceQuality}/5</p>
                        </div>
                      )}
                      {feedback.deliverySpeed && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Speed</p>
                          <p className="font-semibold text-sm">{feedback.deliverySpeed}/5</p>
                        </div>
                      )}
                      {feedback.valueForMoney && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Value</p>
                          <p className="font-semibold text-sm">{feedback.valueForMoney}/5</p>
                        </div>
                      )}
                    </div>
                  )}

                  {feedback.wouldRecommend && (
                    <div className="mt-4 flex items-center space-x-2 text-sm text-green-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Recommends FreshWash</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {!isAuthenticated && (
          <div className="mt-12 text-center bg-primary-50 rounded-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Want to share your experience?
            </h3>
            <p className="text-gray-600 mb-6">
              Login to leave a review and help others make informed decisions.
            </p>
            <a href="/login" className="btn-primary">
              Login to Review
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feedback