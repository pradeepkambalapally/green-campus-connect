const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const Challenge = require('../models/Challenge');
const Badge = require('../models/Badge');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.log('Skipping database seeding: MONGODB_URI not set in server/.env');
      process.exit(0);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas for comprehensive seeding 🌿');

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
        description: 'Mastered the Forest of Waste Wisdom destination',
        icon: '🌲',
        criteria: 'Complete the Forest of Waste Wisdom destination',
        criteriaType: 'module_complete',
        criteriaValue: 'Forest of Waste Wisdom',
      },
      {
        name: 'Water Guardian',
        description: 'Mastered the Water World conservation destination',
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
        description: 'Completed all 5 sustainability learning destinations',
        icon: '🏆',
        criteria: 'Complete all 5 destinations',
        criteriaType: 'special',
        criteriaValue: 'all_modules',
      },
      {
        name: 'Action Hero',
        description: 'Submitted first approved sustainability challenge evidence',
        icon: '📸',
        criteria: 'Have at least 1 challenge submission verified and approved',
        criteriaType: 'challenge_complete',
        criteriaValue: 1,
      },
      {
        name: 'Campus Clean Champion',
        description: 'Completed 3 verified sustainability challenges',
        icon: '🌟',
        criteria: 'Have 3 challenge submissions verified and approved',
        criteriaType: 'challenge_complete',
        criteriaValue: 3,
      },
      {
        name: 'Streak Starter',
        description: 'Logged active campus sustainability participation 2 days in a row',
        icon: '🔥',
        criteria: 'Maintain a 2-day activity streak',
        criteriaType: 'streak',
        criteriaValue: 2,
      },
      {
        name: 'Eco Centurion',
        description: 'Reached 500 sustainability XP and advanced to Level 2',
        icon: '🎖️',
        criteria: 'Earn 500 total XP',
        criteriaType: 'xp_threshold',
        criteriaValue: 500,
      },
      {
        name: 'Green Master',
        description: 'Accumulated 1,000 sustainability XP across learning and real-world challenges',
        icon: '👑',
        criteria: 'Earn 1,000 total XP',
        criteriaType: 'xp_threshold',
        criteriaValue: 1000,
      },
    ];

    for (const b of badgesData) {
      await Badge.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
    }
    console.log('Badges seeded successfully');

    // 2. Comprehensive 5 Learning Modules with rich sections
    const modulesData = [
      // -------------------------------------------------------------
      // Destination 1: Forest of Waste Wisdom
      // -------------------------------------------------------------
      {
        title: 'Waste Segregation, Recycling & Circular Campus Habits',
        slug: 'forest-of-waste-wisdom',
        destination: 'Forest of Waste Wisdom',
        topic: 'Waste Management',
        order: 1,
        icon: '🌲',
        xpReward: 100,
        estimatedReadingTime: '6 mins',
        description: 'Explore the classification of municipal waste, master campus color-coded segregation bins, understand the 3Rs framework, and learn how organic composting transforms waste into fertile soil.',
        learningObjectives: [
          'Differentiate between biodegradable, non-biodegradable, and hazardous campus waste streams.',
          'Correctly sort cafeteria and dormitory waste using color-coded bin standards.',
          'Apply the 3Rs hierarchy: Prioritize reduction and reuse before recycling.',
          'Understand aerobic composting biology and its role in preventing landfill methane emissions.',
          'Implement zero-waste daily routines in lecture halls and student housing.',
        ],
        content: 'Waste management on university campuses is one of the most visible indicators of ecological responsibility. By understanding where discarded items travel after leaving your hands, students can dramatically reduce municipal landfill burdens.',
        topics: ['Waste Classification', 'Color-Coded Segregation', 'The 3Rs Hierarchy', 'Composting Science', 'Zero-Waste Campus Habits'],
        sections: [
          {
            sectionNumber: 1,
            title: 'Types of Waste: Biodegradable, Non-Biodegradable & Hazardous',
            content: 'Campus waste falls into three primary categories: Organic biodegradable waste (food remnants, fruit peels, untreated paper, lawn clippings) which decomposes naturally through bacterial action; Non-biodegradable waste (plastics, aluminum cans, glass, synthetic wrappers) which takes centuries to fragment into microparticles; and Hazardous waste (spent lab reagents, chemical solvents, fluorescent light tubes, lithium batteries, e-waste) that leaches toxic heavy metals like lead and cadmium into groundwater if improperly dumped.',
            campusExample: 'Science buildings and computer labs produce hazardous battery and chemical waste that should never be thrown into common trash cans; dedicated e-waste bins are located near IT service desks.',
            keyTakeaway: 'Always isolate electronic and chemical refuse from standard campus trash to safeguard local water tables.',
          },
          {
            sectionNumber: 2,
            title: 'Waste Segregation & Campus Color-Coded Bins',
            content: 'Segregation at the point of disposal is the single most effective step in solid waste management. Most universities deploy color-coded receptacles: Green for wet organic compostables; Blue for clean dry recyclables (paper, cardboard, PET plastic bottles, clean beverage cans); and Red/Black for non-recyclable residual trash and sanitary waste. Mixing wet food with dry paper contaminates whole batches of recyclable fiber, sending truckloads directly to open landfills.',
            campusExample: 'Throwing an unrinsed coffee cup with milk dregs into a paper recycling bin ruins adjacent clean printer paper and forces sorting facilities to discard the entire bin load.',
            keyTakeaway: 'Keep wet organic refuse strictly separate from dry recyclables — cleanliness preserves recyclability.',
          },
          {
            sectionNumber: 3,
            title: 'The 3Rs Hierarchy: Rethink, Reduce, Reuse & Recycle',
            content: 'Recycling is often mistakenly considered the first solution, but it sits at the bottom of the 3Rs pyramid. Recycling requires significant electrical energy, water washing, and thermal reprocessing. The top priority is "Reduction" — stopping waste before it is generated by refusing disposable packaging. "Reuse" extends product lifecycle through refillable thermoses, reusable cloth bags, and secondhand textbook exchanges.',
            campusExample: 'Campus print centers encourage double-sided printing and digital PDF submission of academic assignments, saving tens of reams of paper every semester.',
            keyTakeaway: 'The cleanest waste is the waste that was never created; prioritize reduction and reuse before relying on recycling.',
          },
          {
            sectionNumber: 4,
            title: 'Composting Chemistry & Landfill Methane Abatement',
            content: 'When organic food scraps are buried in packed landfills, they are deprived of oxygen and undergo anaerobic decomposition. This process releases methane (CH4), a short-lived greenhouse gas with over 28 times the atmospheric warming potency of carbon dioxide. In contrast, controlled aerobic composting introduces oxygen, microbial bacteria, and moisture, converting food scraps into carbon-rich humus that rejuvenates campus garden soil.',
            campusExample: 'University dining halls partner with groundskeeping staff to collect vegetable trimmings and coffee grounds, producing organic mulch for campus botanical gardens.',
            keyTakeaway: 'Aerobic composting diverts organics from landfills, cuts methane emissions, and returns nutrients to the soil.',
          },
          {
            sectionNumber: 5,
            title: 'Practical Zero-Waste Habits for University Life',
            content: 'Sustainable habits are built through small, consistent daily decisions: 1) Carry a reusable stainless steel water bottle and travel cutlery set; 2) Decline paper receipts and printout handouts whenever digital equivalents suffice; 3) Rinse plastic takeaway containers before recycling; 4) Participate in campus thrift and swap fairs during dormitory move-out weeks to keep furniture and clothing out of dumpsters.',
            campusExample: 'Setting up an "End of Semester Donation Box" in dorm lounges collects hundreds of gently used textbooks, desk lamps, and winter jackets for incoming freshmen.',
            keyTakeaway: 'Consistency matters more than perfection: small daily habits collectively eliminate tons of campus landfill waste.',
          },
        ],
        quizQuestions: [
          {
            question: 'What happens when food waste decomposes anaerobically inside tightly packed landfills?',
            options: [
              'It turns into clean drinking water',
              'It generates methane, a potent greenhouse gas with 28x warming potential of CO2',
              'It immediately transforms into fertile garden fertilizer',
              'It absorbs atmospheric carbon dioxide',
            ],
            correctAnswer: 1,
            explanation: 'Anaerobic conditions in landfills produce methane gas (CH4), which is significantly more potent at trapping atmospheric heat than CO2.',
          },
          {
            question: 'In standard campus 3-bin waste segregation, which bin should receive clean cardboard and empty plastic water bottles?',
            options: [
              'Green Bin (Organic / Wet waste)',
              'Blue Bin (Dry Recyclables)',
              'Red / Black Bin (Hazardous / Residual landfill)',
              'Compost pile behind the cafeteria',
            ],
            correctAnswer: 1,
            explanation: 'Blue bins are designated for clean, dry recyclables like cardboard, paper, aluminum, and recyclable plastics.',
          },
          {
            question: 'Why does the sustainability waste hierarchy place "Reduction" and "Reuse" above "Recycling"?',
            options: [
              'Recycling is completely free and requires no energy',
              'Recycling still requires substantial energy, transportation, and processing resources',
              'Recycling creates hazardous radioactive isotopes',
              'Recycled materials can only be used in outer space',
            ],
            correctAnswer: 1,
            explanation: 'Recycling requires energy, water, and industrial processing. Preventing waste generation (Reduction) and reusing goods avoids manufacturing emissions altogether.',
          },
        ],
      },

      // -------------------------------------------------------------
      // Destination 2: Water World
      // -------------------------------------------------------------
      {
        title: 'Freshwater Preservation, Rainwater Harvesting & Leak Mitigation',
        slug: 'water-world',
        destination: 'Water World',
        topic: 'Water Conservation',
        order: 2,
        icon: '💧',
        xpReward: 100,
        estimatedReadingTime: '6 mins',
        description: 'Understand global and regional freshwater scarcity, investigate campus water audit techniques, explore rooftop rainwater collection systems, and discover practical leak-detection practices.',
        learningObjectives: [
          'Recognize that accessible freshwater comprises less than 1% of all water on Earth.',
          'Identify the major sources of hidden water waste in campus residential and academic buildings.',
          'Explain how low-flow plumbing fixtures cut consumption without reducing functionality.',
          'Describe the mechanics and benefits of institutional rooftop rainwater harvesting.',
          'Spot, report, and mitigate plumbing leaks and irrigation runoff on campus grounds.',
        ],
        content: 'Clean freshwater is life’s most essential yet finite resource. Campuses consume millions of liters annually for sanitation, dining, and heating/cooling systems. Efficient stewardship ensures community resilience and aquifer preservation.',
        topics: ['Freshwater Scarcity', 'Low-Flow Aerators', 'Rainwater Harvesting', 'Leak Detection', 'Everyday Water Habits'],
        sections: [
          {
            sectionNumber: 1,
            title: 'The Reality of Global Freshwater Scarcity',
            content: 'While water covers over 70% of Earth’s surface, 97.5% is saline ocean water and 2% is locked in glaciers and polar icecaps. That leaves less than 1% of the planet’s freshwater accessible for human ecosystems, agriculture, and urban communities. Excessive extraction from subterranean aquifers drops groundwater tables faster than precipitation can recharge them, causing soil subsidence and seasonal water stress.',
            campusExample: 'During hot summer months, municipal water authorities often issue rationing notices to universities, emphasizing the urgency of institutional conservation.',
            keyTakeaway: 'Freshwater is finite and non-substitutable; conserving water directly preserves underground aquifers.',
          },
          {
            sectionNumber: 2,
            title: 'Plumbing Efficiency & Low-Flow Aeration Technology',
            content: 'Standard legacy bathroom faucets discharge between 2.2 to 3.0 gallons of water per minute (GPM). Installing low-flow faucet aerators that introduce fine air bubbles into the water stream reduces discharge to 0.5 GPM — an 75% savings — while maintaining perceived stream pressure for handwashing. Similarly, dual-flush toilets provide distinct volumetric flushes (typically 3 liters for liquid waste and 6 liters for solid waste) rather than outdated 13-liter single flushes.',
            campusExample: 'Retrofitting dorm washrooms with 1.5 GPM showerheads and sink aerators saves an estimated 15,000 liters of water per resident student annually.',
            keyTakeaway: 'Aerators mix air into the stream, preserving washing performance while slashing volumetric discharge by over half.',
          },
          {
            sectionNumber: 3,
            title: 'Rooftop Rainwater Catchment & Aquifer Recharge Wells',
            content: 'Campuses feature vast square footage of impervious rooftops, parking garages, and paved walkways. In natural ecosystems, rainwater infiltrates topsoil; on concrete campuses, it turns into destructive stormwater runoff that picks up vehicular oils and overflows city storm drains. Rooftop Rainwater Catchment Systems capture clean precipitation, pass it through first-flush gravel filters, and store it in cisterns for cooling tower makeup water or funnel it into deep recharge wells to revitalize local aquifers.',
            campusExample: 'Rain gardens and bioswales installed beside campus walkways naturally filter storm runoff while irrigating native perennial flowerbeds.',
            keyTakeaway: 'Rainwater harvesting converts destructive urban runoff into valuable non-potable water and subterranean recharge.',
          },
          {
            sectionNumber: 4,
            title: 'Spotting, Measuring & Reporting Plumbing Leaks',
            content: 'A single faucet leaking one drip per second wastes over 3,000 gallons (11,000 liters) of treated drinking water annually — enough for 180 full showers! Running toilets with faulty flapper valves can silently waste 200 gallons per day without making noticeable noise. Quick reporting through campus facilities work orders or maintenance QR codes stops thousands of wasted gallons before they accumulate.',
            campusExample: 'Students who spot a leaking urinal or running toilet can scan maintenance service QR stickers affixed to washroom mirrors to dispatch campus plumbers.',
            keyTakeaway: 'Never ignore a dripping tap or running flush; rapid reporting prevents thousands of liters of clean water waste.',
          },
          {
            sectionNumber: 5,
            title: 'Responsible Water Habits for Campus Students',
            content: 'Personal water habits are straightforward: 1) Turn off the tap while lathering soap or brushing teeth; 2) Keep showers under 5 minutes; 3) Run dormitory washing machines only with full laundry loads and cold wash cycles; 4) Use reusable water bottles and fill them at chilled refill stations rather than purchasing bottled water which requires 3 liters of industrial water to manufacture 1 liter of product.',
            campusExample: 'Installing bottle-filling stations with digital counters on campus has eliminated millions of single-use bottles and saved thousands of gallons of manufacturing water.',
            keyTakeaway: 'Shortening showers by 2 minutes saves up to 40 liters of heated, treated water per person per day.',
          },
        ],
        quizQuestions: [
          {
            question: 'What percentage of Earth’s total water is readily accessible as freshwater for human use?',
            options: [
              'Approximately 25%',
              'Less than 1%',
              'Around 50%',
              'Over 75%',
            ],
            correctAnswer: 1,
            explanation: 'Over 97% of Earth’s water is salt water, and most freshwater is trapped in ice sheets and deep underground, leaving under 1% accessible.',
          },
          {
            question: 'How do faucet aerators achieve major water savings without compromising handwashing usability?',
            options: [
              'They boil the water to steam',
              'They mix ambient air into the water stream to maintain rinse pressure',
              'They reduce water temperature to freezing levels',
              'They shut off water after exactly 3 seconds',
            ],
            correctAnswer: 1,
            explanation: 'Aerators introduce air microbubbles into the stream, maintaining satisfying rinse velocity while reducing total volumetric flow rate.',
          },
          {
            question: 'Roughly how much treated water can a single faucet leaking at one drip per second waste over a year?',
            options: [
              'Only 5 to 10 gallons',
              'Over 3,000 gallons (approx. 11,000 liters)',
              'Zero, because drips evaporate instantly into the atmosphere',
              'Exactly 50 liters',
            ],
            correctAnswer: 1,
            explanation: 'A persistent drip of 1 drop per second wastes over 3,000 gallons of clean water annually, emphasizing the importance of swift leak repair.',
          },
        ],
      },

      // -------------------------------------------------------------
      // Destination 3: Energy Valley
      // -------------------------------------------------------------
      {
        title: 'Energy Conservation, Vampire Draws & Clean Microgrids',
        slug: 'energy-valley',
        destination: 'Energy Valley',
        topic: 'Energy Conservation',
        order: 3,
        icon: '⚡',
        xpReward: 100,
        estimatedReadingTime: '6 mins',
        description: 'Delve into fossil fuel emissions vs renewable electricity, eliminate phantom loads, understand LED photonics, and explore rooftop solar photovoltaics on campus.',
        learningObjectives: [
          'Differentiate renewable energy sources from fossil fuel-based electricity grids.',
          'Understand how heating, ventilation, and air conditioning (HVAC) dominate institutional energy bills.',
          'Identify and eradicate phantom loads (vampire draws) across dormitories and computer labs.',
          'Analyze the efficiency ratio and thermal reduction benefits of commercial LED luminaires.',
          'Adopt energy-smart campus habits like smart power-strip management and natural daylighting.',
        ],
        content: 'Campuses operate like small cities with significant electric, heating, and cooling demands. Transitioning to energy-efficient habits and decentralized solar microgrids reduces institutional carbon footprints and operational expenditures.',
        topics: ['Renewable vs Non-Renewable', 'Phantom / Vampire Loads', 'LED Lighting Efficiency', 'Campus Solar PV', 'Energy-Smart Habits'],
        sections: [
          {
            sectionNumber: 1,
            title: 'Fossil Fuels vs Clean Renewable Energy Sources',
            content: 'Conventional power generation burns fossil fuels (coal, natural gas, petroleum) that discharge billions of tons of carbon dioxide, sulfur oxides, and particulate matter into the atmosphere. In contrast, renewable generation captures natural replenishment cycles: solar photovoltaic arrays harness solar photons; wind turbines convert kinetic air currents into electric current; geothermal systems tap subterranean thermal gradients. Renewable power emits near-zero operational greenhouse gases.',
            campusExample: 'Campuses that install solar canopies over open parking lots generate clean electricity while shading student vehicles from summer solar heat.',
            keyTakeaway: 'Replacing fossil electricity with on-site solar and wind eliminates direct greenhouse gas emissions at the point of power generation.',
          },
          {
            sectionNumber: 2,
            title: 'Classroom & Laboratory Energy Wastage: The HVAC Giant',
            content: 'In university buildings, Heating, Ventilation, and Air Conditioning (HVAC) systems account for 45% to 60% of total electrical and thermal energy use. Conditioning unoccupied seminar halls, leaving windows wide open while air conditioning units run, or setting thermostats to extreme cold or heat forces high-tonnage compressors to consume enormous kilowatt-hours.',
            campusExample: 'Installing infrared motion occupancy sensors in seminar rooms automatically powers down lighting and dials back airflow when rooms are empty for 15 minutes.',
            keyTakeaway: 'Adjusting thermostats by just 1°C closer to outdoor ambient temperature saves up to 5% on monthly HVAC energy consumption.',
          },
          {
            sectionNumber: 3,
            title: 'Vampire Draw & Phantom Power Elimination',
            content: 'Electronic gadgets and appliances consume power even when turned off or left on standby mode. This phenomenon — called phantom load or vampire power — keeps internal clock circuits, remote sensors, and power converters energized. Laptop charging bricks, microwave displays, television standby lights, and gaming consoles continuously draw 5 to 20 watts apiece. Across a campus with thousands of dorm rooms, phantom draws total hundreds of megawatt-hours annually.',
            campusExample: 'Using master smart surge power strips in dorm rooms automatically cuts electricity to secondary peripherals (monitors, speakers) when the primary laptop is powered down.',
            keyTakeaway: 'Unplug power bricks when not actively charging devices or use switched power strips to cut standby vampire loads.',
          },
          {
            sectionNumber: 4,
            title: 'Solid-State LED Lighting vs Traditional Bulbs',
            content: 'Incandescent bulbs waste up to 90% of their electrical input as radiant heat, generating only 10% visible light. Modern Light Emitting Diodes (LEDs) emit light via semiconductor electroluminescence, consuming 80% less electricity for the same lumen output and lasting over 50,000 operational hours — 25 times longer than legacy incandescent filament bulbs.',
            campusExample: 'Upgrading campus library lighting to dimmable LED fixtures with daylight-harvesting sensors cuts lighting electric bills by 70%.',
            keyTakeaway: 'LEDs deliver greater illumination while converting minimal power to unwanted ambient heat.',
          },
          {
            sectionNumber: 5,
            title: 'Everyday Student Energy Conservation Protocols',
            content: 'Students can enforce high-impact energy habits: 1) Switch off projectors, room lights, and audio amplifiers when leaving study rooms; 2) Configure laptops to sleep after 5 minutes of inactivity; 3) Rely on natural daylight from dormitory windows during morning study hours; 4) Take the stairs instead of the elevator for trips between 1 to 3 floors, saving mechanical motor electricity while improving fitness.',
            campusExample: 'Student Eco-Reps host "dorm energy showdowns" where dorms compete to see which residence hall achieves the lowest kilowatt-hour draw over a month.',
            keyTakeaway: 'Simple awareness — turning off lights and unplugging chargers — reduces personal campus electric footprints by double-digit percentages.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is a "phantom load" or "vampire draw" in household and campus electronics?',
            options: [
              'An electrical short circuit causing sparks',
              'Electric power continuously drawn by appliances while powered off or in standby mode',
              'Excessive electricity feeding back into the utility power grid',
              'Energy consumed only during midnight hours',
            ],
            correctAnswer: 1,
            explanation: 'Phantom loads represent standby electrical consumption by chargers, displays, and electronic circuitry when devices are supposedly switched off.',
          },
          {
            question: 'Which building subsystem typically consumes the largest share of institutional campus energy?',
            options: [
              'Vending machine illumination',
              'Heating, Ventilation, and Air Conditioning (HVAC) systems',
              'Campus cafeteria microwaves',
              'Water filtration bubblers',
            ],
            correctAnswer: 1,
            explanation: 'HVAC systems represent 45% to 60% of commercial building energy consumption due to the thermal work of air compression, heating, and circulation.',
          },
          {
            question: 'Why are solid-state LEDs far superior to traditional incandescent light bulbs?',
            options: [
              'They produce high heat to warm up cold lecture rooms',
              'They consume up to 80% less energy and convert almost all power to visible light rather than wasted heat',
              'They can only be powered by nuclear reactors',
              'They require new wiring installations every month',
            ],
            correctAnswer: 1,
            explanation: 'LEDs convert electrical energy into photons with minimal thermal loss, lasting up to 25x longer and using 80% less power than incandescent bulbs.',
          },
        ],
      },

      // -------------------------------------------------------------
      // Destination 4: Green Mobility Trail
      // -------------------------------------------------------------
      {
        title: 'Active Commuting, Public Transit & Decarbonized Campus Travel',
        slug: 'green-mobility-trail',
        destination: 'Green Mobility Trail',
        topic: 'Sustainable Transportation',
        order: 4,
        icon: '🚲',
        xpReward: 100,
        estimatedReadingTime: '6 mins',
        description: 'Examine commuter tailpipe emissions, celebrate the physical and ecological benefits of walking and cycling, evaluate public transit efficiencies, and master carpool coordination.',
        learningObjectives: [
          'Calculate the carbon footprint differential between single-occupancy vehicles and active mobility.',
          'Understand the local air quality health impacts of tailpipe emissions (PM2.5, NOx, VOCs).',
          'Explore campus bicycle sharing infrastructure, dedicated lanes, and secure storage.',
          'Identify optimal public transit routes, campus shuttles, and student carpooling strategies.',
          'Design an efficient multimodal sustainable daily commute.',
        ],
        content: 'Transportation is the single largest sector contributor to national greenhouse gas emissions. University campuses generate thousands of daily commuter trips; opting for active walking, cycling, or shared transit clears traffic congestion and eliminates emissions.',
        topics: ['Tailpipe Carbon Emissions', 'Active Transit Benefits', 'Campus Bike Infrastructure', 'Public Transit & Carpooling', 'Commuter Planning'],
        sections: [
          {
            sectionNumber: 1,
            title: 'Commuter Emissions & Urban Air Quality',
            content: 'Conventional internal combustion engine vehicles emit carbon dioxide, nitrogen oxides (NOx), carbon monoxide, and microscopic particulate matter (PM2.5). A single commuter driving alone in an automobile emits approximately 400 grams of CO2 per mile. In contrast, an electric train emits a fraction of that per passenger-mile, while walking or bicycling produces zero direct tailpipe carbon emissions.',
            campusExample: 'Traffic snarls at university entrance gates during morning rush hours create localized smog pockets that drift into student residence windows.',
            keyTakeaway: 'Shifting from single-occupancy driving to active or shared transit directly slashes atmospheric greenhouse gases and toxic urban smog.',
          },
          {
            sectionNumber: 2,
            title: 'Active Mobility: The Power of Walking & Cycling',
            content: 'Active mobility relies on human kinetic power. Over 50% of urban car trips globally are under 3 miles (5 km) — a distance easily covered in 15 minutes by bicycle or 35 minutes by brisk walking. Cycling burns between 300 to 500 calories per hour, boosts cardiovascular resilience, improves cognitive focus for morning lectures, and emits zero tailpipe pollutants.',
            campusExample: 'Campuses with bike repair stations equipped with free air pumps and metric hex wrenches empower students to service flat tires between classes.',
            keyTakeaway: 'Short vehicular trips are the least fuel-efficient and easiest to replace with walking, running, or cycling.',
          },
          {
            sectionNumber: 3,
            title: 'Campus Bicycle Infrastructure & Pedestrian Safety',
            content: 'A truly green campus separates vehicular corridors from pedestrian paths and bicycle avenues. Installing secure two-tier bike racks, sheltered storage enclosures, and continuous bicycle lanes eliminates the fear of traffic collisions and bicycle theft — the two leading deterrents preventing university students from cycling.',
            campusExample: 'The introduction of a docked campus e-bike share program allows students to quickly traverse hilly campuses between north and south lecture halls.',
            keyTakeaway: 'Protected bike lanes and secure parking transform cycling from an occasional hobby into primary daily campus transport.',
          },
          {
            sectionNumber: 4,
            title: 'Public Transit Integration & Micro-Carpooling',
            content: 'When active transit is not feasible due to distance or inclement weather, public mass transit is the next best solution. A standard city bus carries 50 passengers, replacing up to 40 individual cars on the road and dramatically reducing gridlock. For suburban commuters, organizing 3-person student carpools cuts fuel costs and emissions by 66% per student.',
            campusExample: 'Student ID cards that double as unlimited municipal bus transit passes increase public transit ridership by over 40% in student populations.',
            keyTakeaway: 'A full municipal bus takes dozens of automobiles off campus access roads and frees up acres of parking lot acreage.',
          },
          {
            sectionNumber: 5,
            title: 'Designing Your Sustainable Campus Commuting Strategy',
            content: 'Audit your weekly transportation: 1) Walk or cycle for any trip under 2 miles; 2) Group campus errands into a single trip rather than multiple vehicle dispatches; 3) Pair up with classmates from your neighborhood to coordinate shared rides; 4) Keep a rain poncho and bike lights in your backpack to commute safely in varying weather conditions.',
            campusExample: 'Campus "Bike-to-Campus Day" events award free breakfasts and raffle prizes to students who commute via foot, skateboard, or bicycle.',
            keyTakeaway: 'Active commuting improves physical and mental wellbeing while eliminating vehicular parking fees and fuel costs.',
          },
        ],
        quizQuestions: [
          {
            question: 'Which commuter transport option generates zero direct tailpipe emissions per passenger-mile?',
            options: [
              'Hybrid passenger car with one occupant',
              'Walking or riding a standard bicycle',
              'Rideshare taxi with stop-and-go driving',
              'Diesel campus shuttle bus',
            ],
            correctAnswer: 1,
            explanation: 'Walking and cycling rely on human kinetic energy and produce zero tailpipe emissions or air pollutants.',
          },
          {
            question: 'Roughly what percentage of global urban car trips are under 3 miles (5 km)?',
            options: [
              'Less than 5%',
              'Over 50%',
              'Exactly 100%',
              'Around 1%',
            ],
            correctAnswer: 1,
            explanation: 'Over half of all urban car trips are under 3 miles — distances that can easily and healthily be completed by bike or on foot.',
          },
          {
            question: 'How does sharing a ride with two fellow students (3-person carpool) impact per-passenger emissions and fuel costs?',
            options: [
              'Increases emissions by 300%',
              'Reduces per-passenger emissions and fuel costs by approximately 66%',
              'Has zero effect on emissions or fuel costs',
              'Triples fuel consumption immediately',
            ],
            correctAnswer: 1,
            explanation: 'Distributing one vehicle’s trip across three passengers divides the fuel expenditure and carbon footprint by three — a 66% reduction per person.',
          },
        ],
      },

      // -------------------------------------------------------------
      // Destination 5: Eco Living Island
      // -------------------------------------------------------------
      {
        title: 'Mindful Consumption, Single-Use Elimination & Circular Lifestyle',
        slug: 'eco-living-island',
        destination: 'Eco Living Island',
        topic: 'Responsible Consumption',
        order: 5,
        icon: '🏡',
        xpReward: 100,
        estimatedReadingTime: '6 mins',
        description: 'Examine life-cycle environmental assessments, eradicate single-use disposable plastics, practice mindful purchasing, eliminate food waste, and adopt circular economy habits.',
        learningObjectives: [
          'Understand the "take-make-dispose" linear economy versus circular economic design.',
          'Identify single-use plastic items and replace them with durable, closed-loop alternatives.',
          'Calculate the embodied water and carbon embedded in clothing, electronics, and fast fashion.',
          'Implement effective cafeteria food waste prevention strategies.',
          'Adopt mindful purchasing questions before buying non-essential goods.',
        ],
        content: 'Individual consumer choices drive global production systems. On Eco Living Island, students learn to transition from linear consumption to circular habits — repairing what breaks, refusing needless disposables, and honoring the planetary resources embedded in everyday goods.',
        topics: ['Circular Economy', 'Single-Use Plastics', 'Fast Fashion & Embodied Carbon', 'Food Waste Prevention', 'Mindful Living'],
        sections: [
          {
            sectionNumber: 1,
            title: 'The Linear "Take-Make-Dispose" Model vs The Circular Economy',
            content: 'Industrial consumerism has traditionally followed a linear trajectory: raw natural materials are extracted ("take"), manufactured into goods ("make"), and discarded into landfills or incinerators ("dispose"). The Circular Economy reimagines products and systems to eliminate waste by design: keeping components in circulation through repair, refurbishing, reuse, and closed-loop remanufacturing.',
            campusExample: 'Campus Repair Cafes invite engineering students and community volunteers to repair broken blenders, headphones, and laptop chargers for free.',
            keyTakeaway: 'A circular campus treats end-of-life products as technical and biological nutrients for future products, not trash.',
          },
          {
            sectionNumber: 2,
            title: 'Eliminating Single-Use Plastics on Campus',
            content: 'Single-use plastics — plastic beverage bottles, plastic bags, polystyrene clamshells, plastic straws, and utensil packets — are used for an average of 12 minutes but persist in the environment for 400+ years. They fragment into hazardous microplastics that contaminate marine life and drinking water reservoirs. Eliminating single-use items requires carrying reusable kits: silicone collapsible lunchboxes, canvas bags, and stainless steel drinkware.',
            campusExample: 'University student unions voting to ban single-use plastic water bottles from campus vending machines divert hundreds of thousands of plastic containers annually.',
            keyTakeaway: 'Plastic items used for 10 minutes persist in nature for 400 years; durable reusables are the cleanest alternative.',
          },
          {
            sectionNumber: 3,
            title: 'The Embodied Footprint of Fast Fashion & Consumer Electronics',
            content: 'Every product carries "embodied" carbon, water, and material footprints incurred during raw material extraction, chemical processing, and global freight shipping. A single cotton t-shirt requires approximately 2,700 liters of water to grow the raw cotton — enough drinking water for one person for 2.5 years! Fast fashion encourages rapid disposal of cheaply sewn synthetic polyester garments, shedding plastic microfibers into laundry washwater.',
            campusExample: 'Campus student clothing swaps encourage students to trade clean, unwanted apparel rather than buying fast-fashion garments online.',
            keyTakeaway: 'Wearing clothes for an additional nine months reduces their combined carbon, water, and waste footprints by 20% to 30%.',
          },
          {
            sectionNumber: 4,
            title: 'Cafeteria Food Waste Reduction & Portion Awareness',
            content: 'Globally, one-third of all food produced for human consumption is lost or wasted. Food waste wastes all the agricultural water, fertilizer, tractor fuel, and transportation energy used to harvest and transport it. In campus all-you-can-eat cafeterias, students often pile more food on plates than they can consume, discarding edible calories directly into waste bins.',
            campusExample: 'Cafeterias adopting "trayless dining" observe an immediate 20% drop in food waste because students take only what they can carry and eat.',
            keyTakeaway: 'Take only what you know you will eat; you can always return to the serving line for seconds.',
          },
          {
            sectionNumber: 5,
            title: 'Five Mindful Questions Before Every Purchase',
            content: 'Before purchasing any item, pause and ask: 1) Do I genuinely need this, or is it an impulse want? 2) Can I borrow, rent, or buy it secondhand? 3) Is it built to be repaired and disassembled, or designed for obsolescence? 4) What is its end-of-life disposal path? 5) What are the social and environmental ethics of the company that manufactured it?',
            campusExample: 'Borrowing specialized tools, camping gear, and graduation caps from the campus library sharing locker prevents unnecessary single-use purchases.',
            keyTakeaway: 'Mindful purchasing saves money, reduces clutter, and removes demand from exploitative linear supply chains.',
          },
        ],
        quizQuestions: [
          {
            question: 'What is the core philosophy of a "Circular Economy"?',
            options: [
              'Incinerating all household waste in circular ovens',
              'Designing systems and products so materials and resources stay in productive use indefinitely',
              'Exporting plastic waste in circular shipping routes',
              'Buying only circular shaped goods',
            ],
            correctAnswer: 1,
            explanation: 'A circular economy designs out waste and pollution, keeping products, components, and materials circulating in high-value usage.',
          },
          {
            question: 'Approximately how much water is embodied in the agricultural and manufacturing supply chain of a single conventional cotton t-shirt?',
            options: [
              'About 10 liters',
              'Approximately 2,700 liters (enough drinking water for one person for 2.5 years)',
              'Zero, because cotton grows without moisture',
              'Over 500,000 gallons',
            ],
            correctAnswer: 1,
            explanation: 'Growing, processing, and dyeing the cotton for one t-shirt requires approximately 2,700 liters of water.',
          },
          {
            question: 'What practical campus dining initiative has been proven to reduce cafeteria food waste by approximately 20%?',
            options: [
              'Trayless dining, which discourages students from taking more food than they can carry and eat',
              'Doubling the price of drinking water',
              'Removing all vegetable options from dining halls',
              'Serving meals only once every two days',
            ],
            correctAnswer: 1,
            explanation: 'Removing trays discourages students from loading up multiple dishes impulsively, reducing uneaten food waste by up to 20%.',
          },
        ],
      },
    ];

    for (const m of modulesData) {
      await LearningModule.findOneAndUpdate(
        { destination: m.destination },
        m,
        { upsert: true, new: true }
      );
    }
    console.log('All 5 Comprehensive Learning Destinations seeded successfully! 🗺️');

    // 3. Seed at least 10 Sustainability Challenges
    const challengesData = [
      {
        title: 'Waste Segregation Champion',
        slug: 'waste-segregation-champion',
        description: 'Demonstrate proper 3-stream waste segregation on campus by sorting organic, dry recyclable, and landfill trash into their designated color-coded bins.',
        whyItMatters: 'Over 60% of recyclable paper and plastic is contaminated and sent to landfills due to incorrect bin disposal. Proper sorting enables effective municipal recycling.',
        category: 'waste',
        difficulty: 'easy',
        rewardXP: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        instructions: 'Locate a 3-stream campus waste station (Green/Blue/Black bins). Correctly separate your lunch refuse (food remnants in green, clean drink container in blue) and capture a clear photo.',
        evidenceRequirements: 'Clear photo showing segregated waste correctly placed in or beside the appropriate color-coded campus bins.',
        submissionRules: 'Must be photographed at an official university recycling/waste station.',
        icon: '♻️',
        isActive: true,
      },
      {
        title: 'Plastic-Free Day Challenge',
        slug: 'plastic-free-day',
        description: 'Avoid all single-use plastics for an entire 24 hours. Carry your reusable tumbler, stainless steel cutlery, and canvas tote across campus.',
        whyItMatters: 'Single-use plastics take over 400 years to fragment into microplastics. Choosing reusables directly prevents plastic trash from entering waterways.',
        category: 'lifestyle',
        difficulty: 'easy',
        rewardXP: 60,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        instructions: 'Pack your daily zero-waste kit: reusable drink bottle, travel mug, reusable meal container, and tote bag. Photograph your kit in use in classes or cafeteria.',
        evidenceRequirements: 'Photo of your reusable items in use on campus grounds with your student ID or a campus landmark visible.',
        submissionRules: 'Original photo of your personal reusable kit taken during a regular campus day.',
        icon: '🥤',
        isActive: true,
      },
      {
        title: 'Save Every Drop — Leak Detective',
        slug: 'save-every-drop',
        description: 'Inspect washroom facilities on campus and identify, report, or help resolve dripping faucets and leaking pipe valves.',
        whyItMatters: 'A single faucet leaking one drop per second wastes over 11,000 liters of treated water annually. Swift reporting preserves precious community reservoirs.',
        category: 'water',
        difficulty: 'medium',
        rewardXP: 80,
        startDate: new Date(),
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        instructions: 'Check washroom faucets in campus academic or dorm buildings. If you spot a leak or running toilet, secure the valve or submit a facilities ticket and document your action.',
        evidenceRequirements: 'Photo showing the secured faucet or a screenshot of the maintenance ticket/report submitted to university facilities.',
        submissionRules: 'Include the specific building and washroom location in your written description.',
        icon: '💧',
        isActive: true,
      },
      {
        title: 'Switch It Off: Campus Energy Audit',
        slug: 'switch-it-off',
        description: 'Audit unoccupied classrooms, seminar halls, or common rooms and ensure projectors, computer screens, and lights are switched off.',
        whyItMatters: 'Classrooms left illuminated overnight can waste hundreds of kilowatt-hours, generating unnecessary fossil-fuel power plant emissions.',
        category: 'energy',
        difficulty: 'easy',
        rewardXP: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        instructions: 'Walk through an academic wing after lectures conclude. Find an empty room where equipment was left running, power it down, and document the darkened room.',
        evidenceRequirements: 'Photo showing the empty classroom after powering down lights/projectors, or a photo of the main light switch toggled off.',
        submissionRules: 'Ensure room is unoccupied before turning off lights. State building and room number.',
        icon: '⚡',
        isActive: true,
      },
      {
        title: 'Green Commute: Active Transit Day',
        slug: 'green-commute',
        description: 'Ditch personal vehicular transport! Walk, jog, cycle, or take the university transit shuttle to attend classes.',
        whyItMatters: 'Short car trips under 3 miles generate disproportionately high emissions and toxic PM2.5 exhaust. Active transit produces zero direct tailpipe carbon.',
        category: 'mobility',
        difficulty: 'medium',
        rewardXP: 90,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        instructions: 'Choose walking, cycling, skateboarding, or public bus transit for your commute to campus lectures. Log your journey or capture your bicycle at campus racks.',
        evidenceRequirements: 'Photo of your bicycle parked at campus bike racks or a screenshot of your pedometer/transit app showing your active commute.',
        submissionRules: 'Must demonstrate an actual commute to or across university grounds.',
        icon: '🚲',
        isActive: true,
      },
      {
        title: 'Bring Your Own Bottle (BYOB)',
        slug: 'bring-your-own-bottle',
        description: 'Rely exclusively on a refillable water bottle for an entire week, utilizing campus filtered hydration refill stations.',
        whyItMatters: 'Manufacturing a single disposable plastic bottle requires 3x the volume of water inside the bottle. Refill stations eliminate thousands of bottles weekly.',
        category: 'lifestyle',
        difficulty: 'easy',
        rewardXP: 40,
        startDate: new Date(),
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        instructions: 'Use a reusable bottle and fill it at any campus water refill station. Photograph yourself refilling your bottle at an institutional water dispenser.',
        evidenceRequirements: 'Clear photo showing your reusable bottle being refilled at a campus drinking water fountain or filling station.',
        submissionRules: 'No disposable plastic bottles permitted in the photo.',
        icon: '🧴',
        isActive: true,
      },
      {
        title: 'Campus Clean-Up Drive',
        slug: 'campus-clean-up',
        description: 'Participate in a campus or surrounding perimeter litter collection activity to recover discarded plastics and cigarette butts.',
        whyItMatters: 'Litter on campus lawns washes into stormwater drainage systems, polluting regional rivers and harming urban bird and aquatic wildlife.',
        category: 'waste',
        difficulty: 'hard',
        rewardXP: 150,
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        instructions: 'Spend at least 30 minutes collecting discarded trash from campus grounds, parking borders, or natural trails. Place into heavy-duty collection bags.',
        evidenceRequirements: 'Photo of the collected trash bag(s) with protective work gloves on campus grounds, or a group photo of clean-up participants.',
        submissionRules: 'Wear gloves and practice safe collection hygiene. Note the campus zone cleaned.',
        icon: '🧹',
        isActive: true,
      },
      {
        title: 'Paperless Notes & Digital Submissions',
        slug: 'paperless-notes',
        description: 'Commit to 100% digital study notes, assignment submissions, and e-textbooks for one week without printing paper handouts.',
        whyItMatters: 'Paper manufacturing consumes significant timber, freshwater, and bleach chemicals. Going digital preserves trees and cuts printing expenditures.',
        category: 'waste',
        difficulty: 'easy',
        rewardXP: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        instructions: 'Organize your weekly lecture notes on a digital tablet, laptop, or cloud document. Submit course assignments via the university learning portal.',
        evidenceRequirements: 'Screenshot or photo of your organized digital coursework notebook or digital assignment submission confirmation.',
        submissionRules: 'Demonstrate digital note-taking or assignment upload.',
        icon: '📱',
        isActive: true,
      },
      {
        title: 'Composting Awareness & Organic Waste Action',
        slug: 'composting-awareness',
        description: 'Divert food waste to campus compost bins or document home/dorm balcony aerobic composting practices.',
        whyItMatters: 'Composting diverts nitrogen-rich organic waste from landfills, halting anaerobic methane production and building nutrient-dense topsoil.',
        category: 'waste',
        difficulty: 'medium',
        rewardXP: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        instructions: 'Collect raw vegetable peels, coffee grounds, and fruit rinds. Deposit them into the campus botanical compost pit or garden compost bin.',
        evidenceRequirements: 'Photo of organic kitchen/dorm waste being deposited into an active compost bin or garden compost tumbler.',
        submissionRules: 'Ensure only compostable organic matter (no meat, dairy, or plastics) is pictured.',
        icon: '🌱',
        isActive: true,
      },
      {
        title: 'Food Waste Watch: Clean Plate Challenge',
        slug: 'food-waste-watch',
        description: 'Practice mindful portion control in campus dining halls by taking only what you can finish and returning clean plates for 3 consecutive days.',
        whyItMatters: 'One-third of food produced worldwide is discarded uneaten. Eliminating cafeteria food waste saves the energy, water, and labor embedded in agriculture.',
        category: 'lifestyle',
        difficulty: 'medium',
        rewardXP: 75,
        startDate: new Date(),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        instructions: 'In the campus cafeteria or dining hall, request mindful meal portions. Finish everything on your plate without scraping edible food into garbage bins.',
        evidenceRequirements: 'Photo of your completely finished "clean plate" at the dining hall dish return counter with your dining hall tray.',
        submissionRules: 'Taken at a campus dining hall or student union food court.',
        icon: '🍽️',
        isActive: true,
      },
    ];

    for (const c of challengesData) {
      await Challenge.findOneAndUpdate({ title: c.title }, c, { upsert: true, new: true });
    }
    console.log('10 Comprehensive Sustainability Challenges verified and seeded! 🏆');

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

    console.log('Complete database seeding finished successfully! 🌿');
    process.exit(0);
  } catch (error) {
    console.error('Error during data seeding:', error.message);
    process.exit(1);
  }
};

seedData();
