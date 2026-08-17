import { useNavigate } from "react-router-dom";
import { 
  FaStore, 
  FaChartLine, 
  FaBox, 
  FaUsers, 
  FaArrowRight, 
  FaShieldAlt,
  FaHeadset,
  FaRocket,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaTrophy,
  FaShoppingBag,
  FaCreditCard,
  FaTruck,
  FaHeart,
  FaGlobe,
  FaAward,
  FaBolt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaTwitter,
  FaYoutube
} from "react-icons/fa";
import "./styles/sellerLanding.css";

export default function SellerLanding() {
  const navigate = useNavigate();

  // Dynamic data that will come from API later
  const statsData = {
    totalSellers: 12483,
    activeSellers: 3421,
    totalSales: 52400000, // in rupees
    totalOrders: 156789,
    averageRating: 4.8,
    topCategories: [
      { name: "Clay Pots", count: 3421 },
      { name: "Decorative Items", count: 2893 },
      { name: "Jewelry", count: 2156 },
      { name: "Kitchenware", count: 1872 },
    ],
    recentAchievements: [
      { title: "Best Marketplace 2024", icon: FaTrophy },
      { title: "Top Seller Platform", icon: FaAward },
      { title: "Fastest Growing", icon: FaBolt },
    ],
    testimonials: [
      {
        name: "Priya Sharma",
        location: "Jaipur, Rajasthan",
        rating: 5,
        text: "ClayWare has transformed my pottery business. I've seen a 300% increase in sales within 6 months!",
        avatar: "PS"
      },
      {
        name: "Rahul Verma",
        location: "Delhi, NCR",
        rating: 5,
        text: "The seller dashboard is incredibly intuitive. I can manage my entire inventory in minutes.",
        avatar: "RV"
      },
      {
        name: "Sneha Patel",
        location: "Ahmedabad, Gujarat",
        rating: 5,
        text: "ClayWare's marketing support helped me reach customers I never thought possible.",
        avatar: "SP"
      }
    ],
    benefits: [
      {
        icon: FaRocket,
        title: "Zero Commission",
        description: "No registration fee. Keep 100% of your sales."
      },
      {
        icon: FaShieldAlt,
        title: "Secure Payments",
        description: "Instant settlements with multiple payment options."
      },
      {
        icon: FaHeadset,
        title: "24/7 Support",
        description: "Dedicated seller support team always ready to help."
      },
      {
        icon: FaBox,
        title: "Easy Shipping",
        description: "Integrated logistics with real-time tracking."
      },
      {
        icon: FaChartLine,
        title: "Growth Analytics",
        description: "Advanced analytics to track your business growth."
      },
      {
        icon: FaUsers,
        title: "Seller Community",
        description: "Connect with thousands of fellow artisans."
      }
    ],
    featuredSellers: [
      { name: "Terracotta Dreams", products: 156, rating: 4.9 },
      { name: "Clay Creations", products: 89, rating: 4.8 },
      { name: "Artisan Pottery", products: 234, rating: 4.7 },
      { name: "Earth & Clay", products: 167, rating: 4.9 }
    ],
    platformStats: {
      totalProducts: 45678,
      categories: 24,
      cities: 150,
      countries: 12
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <div className="seller-landing-page">
      {/* Background Elements */}
      <div className="landing-bg-blob landing-bg-blob-1"></div>
      <div className="landing-bg-blob landing-bg-blob-2"></div>
      <div className="landing-bg-blob landing-bg-blob-3"></div>
      <div className="landing-clay-pattern"></div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="#B65A2A"/>
              <path d="M14 14L34 14L34 34L14 34L14 14Z" stroke="white" strokeWidth="3"/>
              <path d="M24 14L24 34" stroke="white" strokeWidth="3"/>
              <path d="M14 24L34 24" stroke="white" strokeWidth="3"/>
              <circle cx="24" cy="24" r="6" fill="white"/>
            </svg>
            <span className="nav-logo-text">ClayWare</span>
          </div>
          <div className="nav-actions">
            <button 
              className="nav-login-btn"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button 
              className="nav-register-btn"
              onClick={() => navigate("/register")}
            >
              Start Selling
              <FaArrowRight className="nav-btn-icon" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaStar className="hero-badge-icon" />
              <span>#1 Craft Marketplace in India</span>
            </div>
            <h1 className="hero-title">
              Build Your<br />
              <span className="hero-highlight">Handcrafted</span> Business
            </h1>
            <p className="hero-description">
              Join India's fastest-growing marketplace for handmade clay products. 
              Connect with thousands of buyers and grow your craft business like never before.
            </p>
            <div className="hero-actions">
              <button 
                className="hero-primary-btn"
                onClick={() => navigate("/register")}
              >
                Start Selling Today
                <FaArrowRight className="btn-icon" />
              </button>
              <button 
                className="hero-secondary-btn"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{statsData.totalSellers.toLocaleString()}+</span>
                <span className="hero-stat-label">Active Sellers</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatCurrency(statsData.totalSales)}</span>
                <span className="hero-stat-label">Total Sales</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat">
                <span className="hero-stat-number">{statsData.averageRating}★</span>
                <span className="hero-stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-floating">
              <div className="floating-card floating-card-1">
                <FaShoppingBag className="floating-icon" />
                <div>
                  <span className="floating-value">15.6K</span>
                  <span className="floating-label">Orders Today</span>
                </div>
              </div>
              <div className="floating-card floating-card-2">
                <FaCreditCard className="floating-icon" />
                <div>
                  <span className="floating-value">₹2.4L</span>
                  <span className="floating-label">Revenue Today</span>
                </div>
              </div>
              <div className="floating-card floating-card-3">
                <FaTruck className="floating-icon" />
                <div>
                  <span className="floating-value">892</span>
                  <span className="floating-label">Orders Shipped</span>
                </div>
              </div>
              <div className="hero-illustration">
                <div className="hero-illustration-inner">
                  <svg width="240" height="240" viewBox="0 0 240 240">
                    <circle cx="120" cy="120" r="100" fill="rgba(182, 90, 42, 0.04)" />
                    <circle cx="120" cy="120" r="70" fill="rgba(182, 90, 42, 0.06)" />
                    <circle cx="120" cy="120" r="40" fill="rgba(182, 90, 42, 0.08)" />
                    <rect x="90" y="80" width="60" height="80" rx="6" fill="rgba(182, 90, 42, 0.12)" />
                    <path d="M105 110 L135 110 M105 125 L135 125 M105 140 L125 140" stroke="rgba(182, 90, 42, 0.3)" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="landing-platform-stats">
        <div className="platform-stats-container">
          <div className="platform-stat-item">
            <span className="platform-stat-number">{statsData.platformStats.totalProducts.toLocaleString()}+</span>
            <span className="platform-stat-label">Products Listed</span>
          </div>
          <div className="platform-stat-divider"></div>
          <div className="platform-stat-item">
            <span className="platform-stat-number">{statsData.platformStats.categories}</span>
            <span className="platform-stat-label">Categories</span>
          </div>
          <div className="platform-stat-divider"></div>
          <div className="platform-stat-item">
            <span className="platform-stat-number">{statsData.platformStats.cities}+</span>
            <span className="platform-stat-label">Cities</span>
          </div>
          <div className="platform-stat-divider"></div>
          <div className="platform-stat-item">
            <span className="platform-stat-number">{statsData.platformStats.countries}</span>
            <span className="platform-stat-label">Countries</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="landing-benefits" id="benefits">
        <div className="benefits-container">
          <div className="section-header">
            <span className="section-tag">Why ClayWare</span>
            <h2 className="section-title">Everything You Need to Succeed</h2>
            <p className="section-description">
              From zero commission to 24/7 support, we provide everything you need to grow your craft business.
            </p>
          </div>
          <div className="benefits-grid">
            {statsData.benefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <div className="benefit-card-icon">
                  <benefit.icon />
                </div>
                <h3 className="benefit-card-title">{benefit.title}</h3>
                <p className="benefit-card-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">What Our Sellers Say</h2>
            <p className="section-description">
              Hear from artisans who have transformed their businesses with ClayWare.
            </p>
          </div>
          <div className="testimonials-grid">
            {statsData.testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star-filled" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <h4 className="testimonial-name">{testimonial.name}</h4>
                <span className="testimonial-location">{testimonial.location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sellers */}
      <section className="landing-featured">
        <div className="featured-container">
          <div className="section-header">
            <span className="section-tag">Featured Sellers</span>
            <h2 className="section-title">Top Artisans on ClayWare</h2>
            <p className="section-description">
              Discover successful sellers who are thriving on our platform.
            </p>
          </div>
          <div className="featured-grid">
            {statsData.featuredSellers.map((seller, index) => (
              <div className="featured-seller-card" key={index}>
                <div className="featured-seller-icon">
                  <FaStore />
                </div>
                <h4 className="featured-seller-name">{seller.name}</h4>
                <div className="featured-seller-details">
                  <span>{seller.products} products</span>
                  <span className="featured-seller-rating">
                    <FaStar className="featured-star" />
                    {seller.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Journey?</h2>
            <p className="cta-description">
              Join thousands of artisans who are building successful businesses on ClayWare.
            </p>
            <div className="cta-actions">
              <button 
                className="cta-primary-btn"
                onClick={() => navigate("/register")}
              >
                Create Seller Account
                <FaArrowRight className="btn-icon" />
              </button>
              <button 
                className="cta-secondary-btn"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
            <div className="cta-benefits">
              <span className="cta-benefit">
                <FaCheckCircle className="cta-check" />
                No Registration Fee
              </span>
              <span className="cta-benefit">
                <FaCheckCircle className="cta-check" />
                Secure Payments
              </span>
              <span className="cta-benefit">
                <FaCheckCircle className="cta-check" />
                24/7 Support
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                  <rect width="48" height="48" rx="14" fill="#B65A2A"/>
                  <path d="M14 14L34 14L34 34L14 34L14 14Z" stroke="white" strokeWidth="3"/>
                  <path d="M24 14L24 34" stroke="white" strokeWidth="3"/>
                  <path d="M14 24L34 24" stroke="white" strokeWidth="3"/>
                  <circle cx="24" cy="24" r="6" fill="white"/>
                </svg>
                <span className="footer-logo-text">ClayWare</span>
              </div>
              <p className="footer-description">
                India's premier marketplace for handcrafted clay products.
              </p>
              <div className="footer-social">
                <FaInstagram className="social-icon" />
                <FaTwitter className="social-icon" />
                <FaYoutube className="social-icon" />
              </div>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <a href="/about">About Us</a>
              <a href="/careers">Careers</a>
              <a href="/press">Press</a>
              <a href="/blog">Blog</a>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <a href="/help">Help Center</a>
              <a href="/faq">FAQ</a>
              <a href="/contact">Contact Us</a>
              <a href="/community">Community</a>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2024 ClayWare. All rights reserved.</span>
            <span className="footer-made-with">
              Made with <FaHeart className="footer-heart" /> in India
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}