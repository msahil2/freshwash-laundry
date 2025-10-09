const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// require('dotenv').config({ path: '../.env' });
 
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('MONGO_URI from env:', process.env.MONGO_URI);




const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Order.deleteMany({});
    await Feedback.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@freshwash.com',
      password: hashedPassword,
      phone: '9876543210',
      address: {
        street: '123 Admin Street',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      },
      isAdmin: true,
      isEmailVerified: true
    });
    await adminUser.save();
    console.log('👤 Created admin user');

    // Create test users
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '9876543211',
        address: {
          street: '456 Customer Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        phone: '9876543212',
        address: {
          street: '789 User Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        }
      },
      {
        name: 'Mike Wilson',
        email: 'mike@example.com',
        password: hashedPassword,
        phone: '9876543213'
      }
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`👥 Created ${createdUsers.length} test users`);

    // Seed services
   const services = [
  // Shirts Category
  {
    name: 'Cotton Shirt',
    category: 'Shirts',
    description: 'Regular cotton shirts - comfortable everyday wear that needs gentle care and professional cleaning.',
    services: {
      wash: { available: true, price: 25.00 },
      iron: { available: true, price: 15.00},
      dryClean: { available: false, price: 0.00 },
      washAndIron: { available: true, price: 35.00 }
    },
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop',
    estimatedTime: '24-36 hours'
  },
  {
    name: 'Formal Shirt',
    category: 'Shirts',
    description: 'Dress shirts for business and formal occasions. Requires special care for crisp, professional appearance.',
    services: {
      wash: { available: true, price: 30.00 },
      iron: { available: true, price: 20.00 },
      dryClean: { available: true, price: 50.00 },
      washAndIron: { available: true, price: 45.00 }
    },
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Designer Shirt',
    category: 'Shirts',
    description: 'Premium designer shirts with special fabric that requires expert handling and care.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 30.00 },
      dryClean: { available: true, price: 80.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },

  // Pants Category
  {
    name: 'Casual Pants',
    category: 'Pants',
    description: 'Everyday casual pants including jeans, chinos, and khakis. Perfect for regular wear.',
    services: {
      wash: { available: true, price: 35.00 },
      iron: { available: true, price: 20.00 },
      dryClean: { available: true, price: 60.00 },
      washAndIron: { available: true, price: 50.00 }
    },
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Formal Trousers',
    category: 'Pants',
    description: 'Business and formal trousers that need professional pressing for a sharp, clean look.',
    services: {
      wash: { available: true, price: 40.00 },
      iron: { available: true, price: 25.00 },
      dryClean: { available: true, price: 70.00 },
      washAndIron: { available: true, price: 60.00 }
    },
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Premium Pants',
    category: 'Pants',
    description: 'High-end pants made from delicate fabrics requiring specialized dry cleaning treatment.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 35.00 },
      dryClean: { available: true, price: 90.00 },
      washAndIron: { available: false, price: 0.00}
    },
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },

  // Dresses Category
  {
    name: 'Casual Dress',
    category: 'Dresses',
    description: 'Everyday dresses perfect for casual outings, made from comfortable and easy-care fabrics.',
    services: {
      wash: { available: true, price: 45.00 },
      iron: { available: true, price: 25.00 },
      dryClean: { available: true, price: 75.00 },
      washAndIron: { available: true, price: 65.00 }
    },
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Party Dress',
    category: 'Dresses',
    description: 'Special occasion dresses with embellishments and delicate details requiring careful handling.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 40.00 },
      dryClean: { available: true, price: 120.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },
  {
    name: 'Wedding Dress',
    category: 'Dresses',
    description: 'Premium wedding and formal gowns requiring expert dry cleaning and preservation techniques.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 60.00 },
      dryClean: { available: true, price: 200.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=400&h=300&fit=crop',
    estimatedTime: '72-96 hours',
    specialInstructions: 'Special handling for beading and delicate fabrics'
  },

  // Bedding Category
  {
    name: 'Bed Sheets',
    category: 'Bedding',
    description: 'Single and double bed sheets, pillowcases, and fitted sheets for a fresh, clean sleep.',
    services: {
      wash: { available: true, price: 50.00 },
      iron: { available: true, price: 30.00 },
      dryClean: { available: false, price: 0.00 },
      washAndIron: { available: true, price: 75.00 }
    },
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Comforter',
    category: 'Bedding',
    description: 'Heavy comforters, quilts, and duvets requiring specialized washing and drying equipment.',
    services: {
      wash: { available: true, price: 80.00 },
      iron: { available: false, price: 0.00},
      dryClean: { available: true, price: 120.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },
  {
    name: 'Blankets',
    category: 'Bedding',
    description: 'Various types of blankets including wool, cotton, and synthetic materials.',
    services: {
      wash: { available: true, price: 60.00 },
      iron: { available: true, price: 25.00 },
      dryClean: { available: true, price: 90.00 },
      washAndIron: { available: true, price: 80.00 }
    },
    image: 'https://images.unsplash.com/photo-1600369672890-ac00f1907858?w=400&h-300&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJsYW5rZXRzfGVufDB8fDB8fHww',
    estimatedTime: '24-48 hours'
  },

  // Jackets Category
  {
    name: 'Casual Jacket',
    category: 'Jackets',
    description: 'Everyday jackets and windbreakers for casual wear and light weather protection.',
    services: {
      wash: { available: true, price: 60.00 },
      iron: { available: true, price: 35.00 },
      dryClean: { available: true, price: 100.00 },
      washAndIron: { available: true, price: 90.00 }
    },
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },
  {
    name: 'Suit Jacket',
    category: 'Jackets',
    description: 'Business suits and formal blazers requiring professional dry cleaning and pressing.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 50.00 },
      dryClean: { available: true, price: 150.00 },
      washAndIron: { available: false, price: 0.00}
    },
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=300&fit=crop',
    estimatedTime: '48-72 hours'
  },
  {
    name: 'Winter Coat',
    category: 'Jackets',
    description: 'Heavy winter coats and parkas with special insulation requiring careful cleaning.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: false, price: 0.00},
      dryClean: { available: true, price: 180.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=300&fit=crop',
    estimatedTime: '72-96 hours'
  },

  // Accessories Category
  {
    name: 'Ties & Scarves',
    category: 'Accessories',
    description: 'Delicate neckties, bow ties, and scarves made from silk and other fine materials.',
    services: {
      wash: { available: false, price: 0.00 },
      iron: { available: true, price: 20.00 },
      dryClean: { available: true, price: 40.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1591729652581-abd20ff6944a?w=400&h=300&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGllcyUyMCUyNiUyMFNjYXJ2ZXN8ZW58MHx8MHx8fDA%3D',
    estimatedTime: '24-48 hours'
  },
  {
    name: 'Caps & Hats',
    category: 'Accessories',
    description: 'Various types of headwear including baseball caps, formal hats, and beanies.',
    services: {
      wash: { available: true, price: 30.00 },
      iron: { available: false, price: 0.00 },
      dryClean: { available: true, price: 50.00 },
      washAndIron: { available: false, price: 0.00 }
    },
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop',
    estimatedTime: '24-48 hours'
  }
];

const createdServices = await Service.insertMany(services);
console.log(`🧺 Created ${createdServices.length} services`);
    // Create sample orders
    const sampleOrders = [
      {
        user: createdUsers[0]._id,
        items: [
          {
            service: createdServices[0]._id,
            serviceType: 'washAndIron',
            quantity: 2,
            price: 35.00,
            subtotal: 70.00
          },
          {
            service: createdServices[3]._id,
            serviceType: 'wash',
            quantity: 1,
            price: 35.00,
            subtotal: 35.00
          }
        ],
        shippingAddress: {
          name: 'John Doe',
          phone: '9876543211',
          street: '456 Customer Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001'
        },
        paymentMethod: 'stripe',
        itemsPrice: 105,
        shippingPrice: 0,
        taxPrice: 10.5,
        totalPrice: 115.5,
        isPaid: true,
        paidAt: new Date(),
        status: 'completed',
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        user: createdUsers[1]._id,
        items: [
          {
            service: createdServices[1]._id,
            serviceType: 'dryClean',
            quantity: 1,
            price: 50,
            subtotal: 50
          }
        ],
        shippingAddress: {
          name: 'Jane Smith',
          phone: '9876543212',
          street: '789 User Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001'
        },
        paymentMethod: 'stripe',
        itemsPrice: 50,
        shippingPrice: 0,
        taxPrice: 5,
        totalPrice: 55,
        isPaid: true,
        paidAt: new Date(),
        status: 'in-progress'
      }
    ];

    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`📦 Created ${createdOrders.length} sample orders`);

    // Create sample feedback
    const sampleFeedback = [
      {
        user: createdUsers[0]._id,
        order: createdOrders[0]._id,
        service: createdServices[0]._id,
        rating: 5,
        comment: 'Excellent service! My shirts came back perfectly clean and pressed. Will definitely use again.',
        serviceQuality: 5,
        deliverySpeed: 4,
        valueForMoney: 5,
        wouldRecommend: true
      },
      {
        user: createdUsers[1]._id,
        order: createdOrders[1]._id,
        service: createdServices[1]._id,
        rating: 4,
        comment: 'Good quality dry cleaning. The shirt looks great, pickup and delivery was on time.',
        serviceQuality: 4,
        deliverySpeed: 4,
        valueForMoney: 4,
        wouldRecommend: true
      },
      {
        user: createdUsers[2]._id,
        rating: 5,
        comment: 'Amazing service! Professional staff, quick turnaround, and reasonable prices. Highly recommended!',
        serviceQuality: 5,
        deliverySpeed: 5,
        valueForMoney: 5,
        wouldRecommend: true
      }
    ];

    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    console.log(`⭐ Created ${createdFeedback.length} feedback entries`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👤 Admin user: admin@freshwash.com / password123`);
    console.log(`   👥 Test users: ${createdUsers.length}`);
    console.log(`   🧺 Services: ${createdServices.length}`);
    console.log(`   📦 Sample orders: ${createdOrders.length}`);
    console.log(`   ⭐ Feedback entries: ${createdFeedback.length}`);
    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log('🔒 Database connection closed');
  process.exit(0);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

runSeed();