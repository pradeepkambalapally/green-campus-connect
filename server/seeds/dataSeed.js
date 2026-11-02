const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('Skipping database seeding: MONGODB_URI not set in server/.env');
      process.exit(0);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas for seeding');

    // 1. Seed Badges
    const badgesData = [
      {
        name: 'Eco Beginner',
        description: 'Began the journey on Green Campus Connect',
        icon: '🌱',
        criteria: 'Sign up and start your first sustainability activity',
        criteriaType: 'special',
        criteriaValue: 'welcome',
      },
      {
        name: 'Waste Warrior',
        description: 'Mastered the Forest of Waste Wisdom',
        icon: '🌲',
        criteria: 'Complete the Forest of Waste Wisdom destination',
        criteriaType: 'module_complete',
        criteriaValue: 'Forest of Waste Wisdom',
      },
      {
        name: 'Water Guardian',
        description: 'Completed Water World conservation modules',
        icon: '💧',
        criteria: 'Complete the Water World destination',
        criteriaType: 'module_complete',
        criteriaValue: 'Water World',
      },
      {
        name: 'Energy Saver',
        description: 'Excelled in Energy Valley efficiency practices',
        icon: '⚡',
        criteria: 'Complete the Energy Valley destination',
        criteriaType: 'module_complete',
        criteriaValue: 'Energy Valley',
      },
      {
        name: 'Green Mobility Champion',
        description: 'Advocated active transit on the Green Mobility Trail',
        icon: '🚲',
        criteria: 'Complete the Green Mobility Trail destination',
        criteriaType: 'module_complete',
        criteriaValue: 'Green Mobility Trail',
      },
      {
        name: 'Sustainability Champion',
        description: 'Earned 1,000+ XP across campus sustainability activities',
        icon: '🏆',
        criteria: 'Accumulate 1000 XP',
        criteriaType: 'xp_threshold',
        criteriaValue: 1000,
      },
    ];

    for (const b of badgesData) {
      await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
    }
    console.log('Badges seeded successfully');

    // 2. Seed Learning Modules (5 Destinations)
    const modulesData = [
      {
        title: 'Waste Segregation & Composting Fundamentals',
        destination: 'Forest of Waste Wisdom',
        description: 'Learn how proper waste sorting and campus composting divert organic matter from landfills and reduce greenhouse emissions.',
        content: `Waste segregation is the sorting of waste into wet (organic/biodegradable) and dry (recyclable/hazardous) streams. On university campuses, over 40% of discarded materials consist of compostable food and paper waste. When organic waste is trapped in landfills without oxygen, it anaerobically decomposes to produce methane — a potent greenhouse gas with 28 times the global warming potential of carbon dioxide. By composting campus food scraps, universities produce nutrient-rich soil humus, return carbon to campus grounds, and drastically reduce hauling emissions.`,
        topics: ['Wet & Dry Sorting', 'Composting Chemistry', 'Landfill Methane', 'Plastic Alternatives'],
        xpReward: 100,
        order: 1,
        icon: '🌲',
        quizQuestions: [
          {
            question: 'What is the primary greenhouse gas produced when food waste decomposes anaerobically in landfills?',
            options: ['Nitrous Oxide', 'Methane', 'Ozone', 'Sulfur Dioxide'],
            correctAnswer: 1,
            explanation: 'Anaerobic decomposition in oxygen-deprived landfills generates methane (CH4), a greenhouse gas far more potent than CO2 in the short term.',
          },
          {
            question: 'Which campus waste category is suitable for aerated organic composting?',
            options: ['Polystyrene foam cups', 'Coffee grounds and vegetable peels', 'Alkaline batteries', 'Treated glossy paper'],
            correctAnswer: 1,
            explanation: 'Coffee grounds, fruit rinds, and vegetable peels are nitrogen- and carbon-rich organic materials ideal for composting.',
          },
        ],
      },
      {
        title: 'Campus Water Conservation & Rainwater Harvesting',
        destination: 'Water World',
        description: 'Understand freshwater scarcity, campus plumbing efficiency, and the mechanics of rooftop rainwater harvesting systems.',
        content: `Freshwater makes up less than 3% of the worlds water resources, of which only a fraction is readily accessible. University campuses consume tens of thousands of gallons daily for sanitation, laboratory processes, and landscape maintenance. Installing low-flow aerators reduces faucet discharge from 2.2 gallons per minute to under 0.5 GPM without sacrificing water velocity. Combined with rooftop catchment systems, rainwater can be filtered and routed to aquifer recharge wells or greywater irrigation, alleviating pressure on municipal reservoirs.`,
        topics: ['Water Footprint', 'Rainwater Harvesting', 'Low-Flow Aerators', 'Greywater Recycling'],
        xpReward: 100,
        order: 2,
        icon: '💧',
        quizQuestions: [
          {
            question: 'How do low-flow aerators reduce water consumption at sinks and faucets?',
            options: ['By cooling the water temperature', 'By mixing air into the water stream', 'By restricting water pressure to zero', 'By recycling wastewater internally'],
            correctAnswer: 1,
            explanation: 'Aerators mix air into the stream, maintaining high perceived pressure and rinse surface area while cutting water flow by over 50%.',
          },
        ],
      },
      {
        title: 'Energy Conservation & Renewable Microgrids',
        destination: 'Energy Valley',
        description: 'Explore campus electricity consumption, phantom loads, LED illumination efficiency, and rooftop photovoltaic arrays.',
        content: `Electricity generation accounts for a major portion of institutional carbon emissions. Phantom loads (standby energy consumed by electronics while plugged in but powered down) can account for up to 10% of campus building power consumption. Modern LED luminaires convert 85% of electrical energy into visible light compared to less than 15% for incandescent bulbs. Rooftop solar photovoltaic panels transform campus roof space into clean energy generation units, offsetting peak kilowatt-hour demand.`,
        topics: ['Vampire Loads', 'LED Lighting Efficiency', 'Solar PV Cells', 'HVAC Optimization'],
        xpReward: 100,
        order: 3,
        icon: '⚡',
        quizQuestions: [
          {
            question: 'What is a "phantom load" or vampire draw in campus electronics?',
            options: ['A short circuit event', 'Power consumed by devices left on standby or plugged in', 'Excess power sent to the grid', 'Overcharged laptop batteries'],
            correctAnswer: 1,
            explanation: 'Phantom loads refer to electric power consumed by appliances and chargers while switched off or in standby mode.',
          },
        ],
      },
      {
        title: 'Active Mobility & Carbon-Neutral Commuting',
        destination: 'Green Mobility Trail',
        description: 'Investigate the lifecycle carbon footprint of student transport modes, bicycle sharing networks, and pedestrian infrastructure.',
        content: `Commuter travel to and from educational institutions constitutes a significant contributor to local urban air pollution (particulate matter PM2.5 and nitrogen oxides) and atmospheric CO2. Shifting short-distance vehicular trips under 3 miles to cycling or walking yields near-zero emissions while providing cardiovascular health benefits. Campus bike-share programs, dedicated bike corridors, and secure storage racks remove structural barriers to low-carbon commuting.`,
        topics: ['Commuter Footprints', 'Bicycle Infrastructure', 'Public Transit Integration', 'Air Quality Metrics'],
        xpReward: 100,
        order: 4,
        icon: '🚲',
        quizQuestions: [
          {
            question: 'Which commuter transport mode produces the lowest direct carbon dioxide emissions per passenger-mile?',
            options: ['Single-occupancy petrol vehicle', 'Walking or cycling', 'Ride-hail taxi', 'Electric motorcycle'],
            correctAnswer: 1,
            explanation: 'Walking and cycling rely on human metabolic energy with zero direct tailpipe carbon emissions.',
          },
        ],
      },
      {
        title: 'Responsible Consumption & Circular Campus Economy',
        destination: 'Eco Living Island',
        description: 'Embrace life-cycle thinking, single-use elimination, repair cafes, and circular purchasing strategies.',
        content: `The linear economy of "take, make, dispose" depletes ecological resources. A circular campus model prioritizes durability, repairability, and material reuse. Every reusable bottle prevents an estimated 150 single-use plastic bottles from entering local waste streams annually. Campus thrift exchanges, equipment repair clinics, and zero-waste dining halls minimize upstream embodied carbon and downstream landfill contamination.`,
        topics: ['Circular Economy', 'Single-Use Elimination', 'Repair vs Replace', 'Sustainable Procurement'],
        xpReward: 100,
        order: 5,
        icon: '🏡',
        quizQuestions: [
          {
            question: 'What is the core principle of a "circular economy" compared to a linear economy?',
            options: ['Exporting all plastic waste to other countries', 'Designing products and systems to eliminate waste and keep materials in use', 'Using disposable items faster', 'Banning all manufactured goods'],
            correctAnswer: 1,
            explanation: 'A circular economy designs out waste and pollution, keeping materials and products in productive use for as long as possible.',
          },
        ],
      },
    ];

    for (const m of modulesData) {
      await LearningModule.findOneAndUpdate({ title: m.title }, m, { upsert: true, new: true });
    }
    console.log('5 Learning Modules seeded successfully');

    // 3. Seed Sustainability Challenges
    const challengesData = [
      {
        title: 'Plastic-Free Day Challenge',
        description: 'Avoid all single-use plastics for 24 hours. Carry your reusable tumbler, cutlery, and cloth tote bag across campus.',
        category: 'waste',
        difficulty: 'easy',
        rewardXP: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        instructions: 'Document your day without single-use plastic. Take a photo of your reusable kit (bottle, lunchbox, bag) in use on campus grounds.',
        evidenceRequirements: 'Clear photo of reusable alternatives with your student badge or campus landmark in the frame.',
        icon: '🥤',
        isActive: true,
      },
      {
        title: 'Bicycle or Walk to Campus Commute',
        description: 'Ditch vehicular transport for the day! Walk, jog, or cycle to your classes to reduce campus emissions.',
        category: 'mobility',
        difficulty: 'medium',
        rewardXP: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        instructions: 'Ride a bicycle or walk to your campus lectures. Log your active trip on a pedometer/app or snap a photo of your bicycle parked at campus racks.',
        evidenceRequirements: 'Photo of your bicycle at campus bike parking or screenshot of walking/cycling activity route.',
        icon: '🚲',
        isActive: true,
      },
      {
        title: 'Campus Energy Audit: Switch Off Unused Lights',
        description: 'Audit unoccupied classrooms or common rooms and ensure projectors, computer screens, and lights are switched off.',
        category: 'energy',
        difficulty: 'easy',
        rewardXP: 60,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        instructions: 'Identify any empty seminar rooms with active illumination or monitors. Turn them off and capture evidence.',
        evidenceRequirements: 'Photo showing empty classroom switched off or switchboard toggled to off position.',
        icon: '⚡',
        isActive: true,
      },
      {
        title: 'Save Water & Report Campus Plumbing Leaks',
        description: 'Inspect washroom facilities on campus and report or help fix dripping taps and leaking valves.',
        category: 'water',
        difficulty: 'easy',
        rewardXP: 75,
        startDate: new Date(),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        instructions: 'Ensure all washroom taps are properly sealed after use. Report any persistent dripping fixtures to campus maintenance.',
        evidenceRequirements: 'Photo of secured faucet or copy of maintenance report ticket submitted.',
        icon: '💧',
        isActive: true,
      },
    ];

    for (const c of challengesData) {
      await Challenge.findOneAndUpdate({ title: c.title }, c, { upsert: true, new: true });
    }
    console.log('4 Challenges seeded successfully');

    // 4. Seed Demo Leaderboard Students
    const demoStudents = [
      { name: 'Maya Chen', email: 'maya.chen@campus.edu', xp: 1450, level: 3, streak: 8, role: 'student' },
      { name: 'Alex Rivera', email: 'alex.rivera@campus.edu', xp: 1120, level: 3, streak: 5, role: 'student' },
      { name: 'Priya Patel', email: 'priya.patel@campus.edu', xp: 870, level: 2, streak: 4, role: 'student' },
      { name: 'Jordan Lee', email: 'jordan.lee@campus.edu', xp: 620, level: 2, streak: 3, role: 'student' },
    ];

    for (const s of demoStudents) {
      const existing = await User.findOne({ email: s.email });
      if (!existing) {
        await User.create({
          ...s,
          password: 'Password@123',
        });
      }
    }
    console.log('Demo leaderboard students seeded');

    console.log('Database seeding completed successfully! 🌿');
    process.exit(0);
  } catch (error) {
    console.error('Error during data seeding:', error.message);
    process.exit(1);
  }
};

seedData();
