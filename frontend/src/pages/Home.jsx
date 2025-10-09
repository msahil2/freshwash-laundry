import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  Clock, 
  Shield, 
  Truck, 
  Star, 
  ArrowRight,
  CheckCircle,
  Users,
  Award
} from 'lucide-react'
import { servicesAPI, feedbackAPI } from '../utils/api'
import { DisplayRating } from '../components/RatingStars'
import CartSidebar from '../components/CartSidebar'

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState([])
  const [recentFeedback, setRecentFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, feedbackRes] = await Promise.all([
          servicesAPI.getAll(),
          feedbackAPI.getAll()
        ])
        
        // Get first 6 services as featured
        setFeaturedServices(servicesRes.data.services.slice(0, 6))
        
        // Get recent feedback with high ratings
        const highRatedFeedback = feedbackRes.data.feedback
          .filter(f => f.rating >= 4)
          .slice(0, 6)
        setRecentFeedback(highRatedFeedback)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Free Pickup & Delivery",
      description: "We collect and deliver your laundry right to your doorstep at no extra cost."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24-48 Hour Service",
      description: "Quick turnaround time with same-day and next-day delivery options available."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Care & Protection",
      description: "Your clothes are treated with premium care using eco-friendly detergents."
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Professional Quality",
      description: "Expert cleaning, pressing, and folding for that fresh, crisp look every time."
    }
  ]

  const stats = [
    { icon: <Users className="h-8 w-8" />, number: "10,000+", label: "Happy Customers" },
    { icon: <CheckCircle className="h-8 w-8" />, number: "50,000+", label: "Orders Completed" },
    { icon: <Award className="h-8 w-8" />, number: "4.8", label: "Average Rating" },
    { icon: <Clock className="h-8 w-8" />, number: "24hrs", label: "Fastest Delivery" }
  ]

  return (
    <div className="min-h-screen">
      <CartSidebar />
      
      {/* Hero Section */}
      <section className="hero-gradient section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  <span className="text-gradient">Clean Clothes,</span>
                  <br />
                  Happy You
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Professional laundry services with free pickup and delivery. 
                  Experience the convenience of fresh, clean clothes without the hassle.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/services" className="btn-primary text-center">
                  Browse Services
                  <ArrowRight className="h-5 w-5 ml-2 inline" />
                </Link>
                <Link to="/contact" className="btn-outline text-center">
                  Schedule Pickup
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">4.8/5</span>
                  <span className="text-gray-600">from 2,500+ reviews</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="/images/hero-laundry.jpg"
                  alt="Fresh clean laundry"
                  className="rounded-2xl shadow-2xl"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=400&fit=crop'
                  }}
                />
              </div>
              <div className="absolute top-4 right-4 z-20 glass-effect rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">24hrs</div>
                  <div className="text-sm text-gray-600">Express Service</div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 z-20 glass-effect rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">FREE</div>
                  <div className="text-sm text-gray-600">Pickup & Delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FreshWash?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best laundry service experience with 
              convenience, quality, and care at the forefront.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  {React.cloneElement(stat.icon, { className: "h-8 w-8 text-white" })}
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From everyday essentials to specialty items, we handle all your laundry needs 
              with professional care and attention to detail.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-300 h-6 rounded w-3/4"></div>
                    <div className="bg-gray-300 h-4 rounded w-full"></div>
                    <div className="bg-gray-300 h-4 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => (
                <div key={service._id} className="card group">
                  <div className="relative overflow-hidden rounded-lg mb-6">
                    <img
                      src={service.image || '/images/default-service.jpg'}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/default-service.jpg'
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600 font-medium">
                      {service.category}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      From ₹{Math.min(...Object.values(service.services).filter(s => s.available).map(s => s.price))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services" className="btn-primary">
              View All Services
              <ArrowRight className="h-5 w-5 ml-2 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers 
              have to say about our service.
            </p>
          </div>

          {recentFeedback.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentFeedback.map((feedback) => (
                <div key={feedback._id} className="card">
                  <div className="mb-4">
                    <DisplayRating rating={feedback.rating} size="sm" showValue={false} />
                  </div>
                  <p className="text-gray-600 mb-4 italic">
                    "{feedback.comment}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {feedback.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {feedback.user?.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews yet. Be the first to leave feedback!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-blue-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the FreshWash Difference?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their laundry. 
            Schedule your first pickup today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200">
              Get Started Now
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-all duration-200">
              Schedule Pickup
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home