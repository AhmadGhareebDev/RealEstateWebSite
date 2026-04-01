
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User');
const Property = require('../models/Property');
const Review = require('../models/Review');
const AgentVerification = require('../models/AgentVerification');

const saltRounds = 10;

const img = {
  luxury: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2069',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070',
    'https://images.unsplash.com/photo-1600047509807-b608f8da735c?q=80&w=2069'
  ],
  modern: [
    'https://images.unsplash.com/photo-1600566753376-12c8cc7a9150?q=80&w=2070',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070',
    'https://images.unsplash.com/photo-1600210482417-707283df2f3c?q=80&w=2070'
  ],
  apartment: [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2070',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070'
  ],
  villa: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070',
    'https://images.unsplash.com/photo-1600566753376-12c8cc7a9150?q=80&w=2070',
    'https://images.unsplash.com/photo-1582408463333-e1cb843d4c9c?q=80&w=2070'
  ],
  cottage: [
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2065',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?q=80&w=2070'
  ]
};

const fakeLicenses = [
  { licenseNumber: '01987654', state: 'CA', agentName: 'Michael Johnson' },
  { licenseNumber: '8854321',  state: 'NY', agentName: 'Sarah Williams' },
  { licenseNumber: '0678901',  state: 'TX', agentName: 'David Martinez' },
  { licenseNumber: '3344556',  state: 'FL', agentName: 'Jessica Brown' },
  { licenseNumber: '11223344', state: 'IL', agentName: 'Robert Lee' },
  { licenseNumber: '99887766', state: 'GA', agentName: 'Emily Davis' },
  { licenseNumber: '20251117', state: 'CA', agentName: 'Jamal Unes' },
  { licenseNumber: '55556666', state: 'NY', agentName: 'Ahmed Khan' }
];

const users = [

  { username: 'ahmed123',    email: 'ahmed@gmail.com',    password: '123456', phone: '+201012345678', location: 'Cairo',        role: 'user' },
  { username: 'mohamed22',   email: 'mohamed@gmail.com',  password: '123456', phone: '+201122334455', location: 'Alexandria',   role: 'user' },
  { username: 'fatma_ali',   email: 'fatma@gmail.com',    password: '123456', phone: '+201299887766', location: 'Giza',         role: 'user' },
  { username: 'youssef_k',   email: 'youssef@gmail.com',  password: '123456', phone: '+201045678901', location: 'Sheikh Zayed', role: 'user' },
  { username: 'mariam_s',    email: 'mariam@gmail.com',   password: '123456', phone: '+201123456789', location: 'New Cairo',    role: 'user' },

  { username: 'jamal_agent', email: 'jamal@gmail.com',    password: '123456', phone: '+201011112222', location: 'Cairo',     role: 'agent', licenseNumber: '20251117', licenseState: 'CA', isVerified: true },
  { username: 'sarah_pro',   email: 'sarah@gmail.com',    password: '123456', phone: '+201033334444', location: 'New Cairo', role: 'agent', licenseNumber: '8854321',  licenseState: 'NY', isVerified: true },
  { username: 'david_tx',    email: 'david@gmail.com',    password: '123456', phone: '+201055556666', location: 'Maadi',     role: 'agent', licenseNumber: '0678901',  licenseState: 'TX', isVerified: true },
  { username: 'luxe_agent',  email: 'luxe@gmail.com',     password: '123456', phone: '+201077778888', location: 'Zamalek',   role: 'agent', licenseNumber: '3344556',  licenseState: 'FL', isVerified: true }
];

mongoose.connect(process.env.DATABASE_URL)
  .then(async () => {
    console.log('🌱 Starting complete database seed...');

    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    await AgentVerification.deleteMany({});

    await AgentVerification.insertMany(fakeLicenses);
    console.log(`✅ ${fakeLicenses.length} fake licenses seeded`);

    const usersWithHashedPassword = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, saltRounds),
        isEmailVerified: true,
        emailVerificationCode: undefined,
        emailVerificationExpires: undefined
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPassword);
    console.log(`✅ ${createdUsers.length} users seeded (5 users + 4 agents)`);

    const u = Object.fromEntries(createdUsers.map(u => [u.username, u._id]));

    const fsboListings = [

      { title: "Cozy Family Home - Maadi", price: 3200000, location: "Maadi, Cairo", bedrooms: 3, bathrooms: 2, area: 180, description: "Charming family home in quiet Maadi neighborhood. Close to schools and parks. Recently renovated kitchen and bathrooms.", type: "sale", listingType: "fsbo", listedBy: u['ahmed123'], images: img.cottage, status: 'active' },
      { title: "Small Studio - Garden City", price: 7500, location: "Garden City, Cairo", bedrooms: 1, bathrooms: 1, area: 45, description: "Perfect studio apartment for singles or students. Walking distance to downtown and the Nile corniche.", type: "rent", listingType: "fsbo", listedBy: u['ahmed123'], images: img.apartment, status: 'active' },
      { title: "Two-Bedroom Near Metro - Giza", price: 1800000, location: "Giza", bedrooms: 2, bathrooms: 1, area: 110, description: "Affordable apartment near Giza metro station. Great commute access. Includes balcony and storage room.", type: "sale", listingType: "fsbo", listedBy: u['ahmed123'], images: img.modern, status: 'active' },

      { title: "Seafront Apartment - Miami, Alex", price: 2800000, location: "Miami, Alexandria", bedrooms: 2, bathrooms: 1, area: 130, description: "Light-filled apartment with direct sea views from every room. Furnished and move-in ready.", type: "sale", listingType: "fsbo", listedBy: u['mohamed22'], images: img.modern, status: 'active' },
      { title: "Furnished Room for Rent - Smouha", price: 5000, location: "Smouha, Alexandria", bedrooms: 1, bathrooms: 1, area: 35, description: "Furnished room in shared apartment. All utilities included. Near Smouha University campus.", type: "rent", listingType: "fsbo", listedBy: u['mohamed22'], images: img.apartment, status: 'active' },
      { title: "Renovated Flat - Roushdy, Alex", price: 2100000, location: "Roushdy, Alexandria", bedrooms: 3, bathrooms: 2, area: 160, description: "Recently renovated flat in the heart of Roushdy. New flooring, modern kitchen, and fresh paint throughout.", type: "sale", listingType: "fsbo", listedBy: u['mohamed22'], images: img.cottage, status: 'active' },

      { title: "Ground Floor with Garden - 6th October", price: 2500000, location: "6th of October City", bedrooms: 3, bathrooms: 2, area: 200, description: "Spacious ground floor with private garden. Family-friendly compound location with playground and swimming pool.", type: "sale", listingType: "fsbo", listedBy: u['fatma_ali'], images: img.villa, status: 'active' },
      { title: "Duplex for Rent - Dokki", price: 12000, location: "Dokki, Cairo", bedrooms: 3, bathrooms: 2, area: 220, description: "Elegant duplex with separate living and dining areas. Quiet street, close to metro and shopping.", type: "rent", listingType: "fsbo", listedBy: u['fatma_ali'], images: img.luxury, status: 'active' },
      { title: "Budget Apartment - Haram", price: 900000, location: "Haram, Giza", bedrooms: 2, bathrooms: 1, area: 85, description: "Very affordable apartment for first-time buyers. Basic finishes, functional layout, near main road.", type: "sale", listingType: "fsbo", listedBy: u['fatma_ali'], images: img.apartment, status: 'active' },

      { title: "Modern Flat - Sheikh Zayed", price: 3800000, location: "Sheikh Zayed City", bedrooms: 3, bathrooms: 2, area: 190, description: "Contemporary design flat in premium compound. Open plan kitchen, large balcony, compound gym and pool access.", type: "sale", listingType: "fsbo", listedBy: u['youssef_k'], images: img.modern, status: 'active' },
      { title: "Furnished Apartment - 5th Settlement", price: 15000, location: "5th Settlement, Cairo", bedrooms: 2, bathrooms: 2, area: 140, description: "Tastefully furnished apartment ready for immediate move-in. Modern appliances and air conditioning throughout.", type: "rent", listingType: "fsbo", listedBy: u['youssef_k'], images: img.luxury, status: 'active' },
      { title: "Penthouse - October Gardens", price: 4500000, location: "October Gardens, 6th October", bedrooms: 4, bathrooms: 3, area: 280, description: "Stunning penthouse with rooftop terrace and panoramic views. Ideal for entertaining. Private elevator.", type: "sale", listingType: "fsbo", listedBy: u['youssef_k'], images: img.luxury, status: 'active' },

      { title: "Studio in New Cairo Compound", price: 9000, location: "New Cairo", bedrooms: 1, bathrooms: 1, area: 55, description: "Compact studio inside gated compound. Includes access to gym, pool, and community center.", type: "rent", listingType: "fsbo", listedBy: u['mariam_s'], images: img.apartment, status: 'active' },
      { title: "Three-Bed Apartment - Rehab City", price: 2900000, location: "Rehab City, Cairo", bedrooms: 3, bathrooms: 2, area: 175, description: "Well-maintained apartment in family compound. Near international schools and shopping mall. Parking included.", type: "sale", listingType: "fsbo", listedBy: u['mariam_s'], images: img.modern, status: 'active' },
      { title: "Rooftop Studio - Heliopolis", price: 8000, location: "Heliopolis, Cairo", bedrooms: 1, bathrooms: 1, area: 50, description: "Bright rooftop studio with city views. Recently renovated with modern bathroom and kitchenette. Great for singles.", type: "rent", listingType: "fsbo", listedBy: u['mariam_s'], images: img.cottage, status: 'active' }
    ];

    const agentListings = [

      { title: "Luxury Penthouse with Nile View - Zamalek", price: 12500000, location: "Zamalek, Cairo", bedrooms: 4, bathrooms: 3, area: 450, description: "Stunning penthouse with panoramic Nile views, premium finishes, private terrace, and 24/7 security. Features marble floors, Italian kitchen, smart home.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.luxury, isShowcase: true, status: 'active' },
      { title: "Modern Villa with Private Pool - New Cairo", price: 8900000, location: "New Cairo", bedrooms: 5, bathrooms: 4, area: 650, description: "Contemporary villa with landscaped garden, swimming pool, and maid's room. Located in prime New Cairo compound.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.villa, isShowcase: true, status: 'active' },
      { title: "Family House with Garden - 6th October", price: 5200000, location: "6th of October City", bedrooms: 4, bathrooms: 3, area: 380, description: "Spacious family home in quiet neighborhood. Large garden, garage, and close to international schools.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.villa, status: 'active' },
      { title: "Modern Townhouse - Rehab City", price: 4200000, location: "Rehab City, Cairo", bedrooms: 3, bathrooms: 2, area: 250, description: "Contemporary townhouse in family-friendly compound. Parks, pools, and shopping within walking distance.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.modern, status: 'active' },
      { title: "Investment Apartment Block - Nasr City", price: 15000000, location: "Nasr City, Cairo", bedrooms: 6, bathrooms: 4, area: 800, description: "Full apartment block for investment. Six units, all currently rented. Strong rental yield in prime location.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.modern, status: 'active' },
      { title: "Executive Apartment - Smart Village", price: 22000, location: "Smart Village, 6th October", bedrooms: 2, bathrooms: 2, area: 160, description: "Premium apartment near Smart Village tech hub. Ideal for professionals. Furnished with modern amenities.", type: "rent", listingType: "agent", listedBy: u['jamal_agent'], images: img.luxury, status: 'active' },
      { title: "Chalet - Ain Sokhna", price: 2800000, location: "Ain Sokhna", bedrooms: 2, bathrooms: 1, area: 120, description: "Beachfront chalet with direct access to crystal-clear waters. Gated resort with pools, restaurants, and spa.", type: "sale", listingType: "agent", listedBy: u['jamal_agent'], images: img.villa, status: 'active' },

      { title: "Fully Furnished Apartment - Downtown Cairo", price: 18000, location: "Downtown, Cairo", bedrooms: 2, bathrooms: 1, area: 85, description: "Chic furnished apartment in the heart of Cairo. Walking distance to metro, restaurants, and shopping.", type: "rent", listingType: "agent", listedBy: u['sarah_pro'], images: img.apartment, isShowcase: true, status: 'active' },
      { title: "Studio Apartment - Nasr City", price: 8500, location: "Nasr City, Cairo", bedrooms: 1, bathrooms: 1, area: 65, description: "Compact and efficient studio perfect for students or young professionals. Near universities and transport.", type: "rent", listingType: "agent", listedBy: u['sarah_pro'], images: img.apartment, status: 'active' },
      { title: "Ground Floor Apartment - Heliopolis", price: 12000, location: "Heliopolis, Cairo", bedrooms: 2, bathrooms: 2, area: 120, description: "Spacious ground floor apartment with garden access. Quiet residential area near shops and cafes.", type: "rent", listingType: "agent", listedBy: u['sarah_pro'], images: img.apartment, status: 'active' },
      { title: "Luxury Office Space - New Cairo", price: 35000, location: "New Cairo Business District", bedrooms: 0, bathrooms: 2, area: 200, description: "Premium office space with conference rooms, reception area, and panoramic views. Fully serviced building.", type: "rent", listingType: "agent", listedBy: u['sarah_pro'], images: img.modern, status: 'active' },
      { title: "Renovated Classic Apartment - Zamalek", price: 4500000, location: "Zamalek, Cairo", bedrooms: 3, bathrooms: 2, area: 200, description: "Beautifully renovated period apartment. High ceilings, original hardwood floors, modern kitchen and bathrooms.", type: "sale", listingType: "agent", listedBy: u['sarah_pro'], images: img.luxury, status: 'active' },
      { title: "Serviced Apartment - Mohandessin", price: 20000, location: "Mohandessin, Cairo", bedrooms: 2, bathrooms: 1, area: 100, description: "Hotel-style serviced apartment. Daily cleaning, concierge, and breakfast included. Monthly leases available.", type: "rent", listingType: "agent", listedBy: u['sarah_pro'], images: img.modern, isShowcase: true, status: 'active' },

      { title: "Beachfront Apartment - Alexandria", price: 3500000, location: "Miami, Alexandria", bedrooms: 3, bathrooms: 2, area: 220, description: "Beautiful sea-view apartment in Alexandria's prestigious Miami district. Direct beach access, renovated.", type: "sale", listingType: "agent", listedBy: u['david_tx'], images: img.modern, isShowcase: true, status: 'active' },
      { title: "Duplex with Rooftop - Maadi", price: 6800000, location: "Maadi, Cairo", bedrooms: 3, bathrooms: 2, area: 280, description: "Elegant duplex with private rooftop terrace. Modern amenities, secure building, near international schools.", type: "sale", listingType: "agent", listedBy: u['david_tx'], images: img.modern, status: 'active' },
      { title: "Sea View Studio - North Coast", price: 15000, location: "North Coast", bedrooms: 1, bathrooms: 1, area: 55, description: "Seasonal rental studio with stunning sea view. Perfect for summer vacation. Fully furnished and equipped.", type: "rent", listingType: "agent", listedBy: u['david_tx'], images: img.apartment, status: 'active' },
      { title: "Commercial Shop - Mohandessin", price: 5000000, location: "Mohandessin, Cairo", bedrooms: 0, bathrooms: 1, area: 80, description: "Prime retail space on main commercial street. High foot traffic, suitable for any business. Ready to use.", type: "sale", listingType: "agent", listedBy: u['david_tx'], images: img.modern, status: 'active' },
      { title: "Three-Story Building - Old Cairo", price: 8500000, location: "Old Cairo", bedrooms: 6, bathrooms: 3, area: 500, description: "Historic building with traditional architecture. Three floors, each with separate entrance. Investment opportunity.", type: "sale", listingType: "agent", listedBy: u['david_tx'], images: img.cottage, status: 'active' },
      { title: "Garden Apartment - Katameya", price: 16000, location: "Katameya, Cairo", bedrooms: 3, bathrooms: 2, area: 180, description: "Beautiful garden apartment in upscale Katameya compound. Private garden, shared pool, security 24/7.", type: "rent", listingType: "agent", listedBy: u['david_tx'], images: img.villa, status: 'active' },

      { title: "Penthouse with City View - Sheikh Zayed", price: 7500000, location: "Sheikh Zayed City", bedrooms: 3, bathrooms: 2, area: 320, description: "Luxury penthouse with breathtaking city views. Premium building with gym, pool, and concierge service.", type: "sale", listingType: "agent", listedBy: u['luxe_agent'], images: img.luxury, isShowcase: true, status: 'active' },
      { title: "Executive Apartment - Zamalek", price: 25000, location: "Zamalek, Cairo", bedrooms: 2, bathrooms: 2, area: 150, description: "High-end apartment in prestigious Zamalek. Near embassies, galleries, and fine dining. Includes parking.", type: "rent", listingType: "agent", listedBy: u['luxe_agent'], images: img.luxury, status: 'active' },
      { title: "Mansion - Katameya Heights", price: 35000000, location: "Katameya Heights, Cairo", bedrooms: 7, bathrooms: 6, area: 1200, description: "Ultra-luxe mansion with private pool, cinema room, staff quarters, and landscaped grounds. Golf course views.", type: "sale", listingType: "agent", listedBy: u['luxe_agent'], images: img.villa, isShowcase: true, status: 'active' },
      { title: "Ski Chalet Style Villa - North Coast", price: 18000000, location: "Hacienda Bay, North Coast", bedrooms: 5, bathrooms: 4, area: 500, description: "Unique architectural design villa at Hacienda Bay. Infinity pool, beachfront, private garden, and premium finishes.", type: "sale", listingType: "agent", listedBy: u['luxe_agent'], images: img.luxury, status: 'active' },
      { title: "Luxury Loft - New Administrative Capital", price: 6000000, location: "New Administrative Capital", bedrooms: 2, bathrooms: 2, area: 250, description: "Modern loft-style apartment with double-height ceilings. First delivery in Egypt's new capital city.", type: "sale", listingType: "agent", listedBy: u['luxe_agent'], images: img.modern, status: 'active' },
      { title: "Presidential Suite Rental - Four Seasons", price: 80000, location: "Nile Plaza, Cairo", bedrooms: 3, bathrooms: 3, area: 300, description: "Monthly rental of a presidential suite at the Four Seasons. Full hotel services, Nile views, butler service.", type: "rent", listingType: "agent", listedBy: u['luxe_agent'], images: img.luxury, isShowcase: true, status: 'active' }
    ];

    const allListings = [...fsboListings, ...agentListings];
    const createdProps = await Property.insertMany(allListings);
    console.log(`✅ ${fsboListings.length} FSBO + ${agentListings.length} Agent = ${createdProps.length} listings seeded`);

    await Review.insertMany([
      { rating: 5, comment: "Jamal is an exceptional agent! Very professional and found us the perfect home.", reviewer: u['ahmed123'], agent: u['jamal_agent'] },
      { rating: 5, comment: "Sarah helped us sell our apartment above asking price. Highly recommended!", reviewer: u['mohamed22'], agent: u['sarah_pro'] },
      { rating: 4, comment: "David is knowledgeable about Maadi market. Smooth transaction.", reviewer: u['fatma_ali'], agent: u['david_tx'] },
      { rating: 5, comment: "Jessica found our dream villa with Nile view. Outstanding service!", reviewer: u['youssef_k'], agent: u['luxe_agent'] },
      { rating: 5, comment: "Amazing penthouse! Exactly as described and the views are breathtaking.", reviewer: u['mariam_s'], property: createdProps[15]._id },
      { rating: 4, comment: "Great family home in quiet neighborhood. Perfect for our kids.", reviewer: u['ahmed123'], property: createdProps[17]._id },
      { rating: 5, comment: "Beautifully furnished apartment. Move-in ready condition.", reviewer: u['mohamed22'], property: createdProps[22]._id },
      { rating: 4, comment: "Excellent location near the sea. Well-maintained building.", reviewer: u['fatma_ali'], property: createdProps[28]._id }
    ]);
    console.log('✅ 8 reviews seeded');

    console.log('\n🎉 COMPLETE SEED SUCCESSFUL!');
    console.log('──────────────────────────────');
    console.log(`   ${fakeLicenses.length} fake licenses`);
    console.log(`   5 regular users + 4 agents = 9 users`);
    console.log(`   ${fsboListings.length} FSBO + ${agentListings.length} Agent = ${allListings.length} listings`);
    console.log(`   8 reviews`);
    console.log('──────────────────────────────');
    console.log('Login as user:  ahmed@gmail.com / 123456');
    console.log('Login as agent: jamal@gmail.com / 123456');
    console.log('');

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Seed failed:', err.message);
    mongoose.connection.close();
  });