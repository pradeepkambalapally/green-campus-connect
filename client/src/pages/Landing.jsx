import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Leaf, TreePine, Droplets, Zap, Bike, Recycle,
  BookOpen, Trophy, Users, Target, Award, TrendingUp,
  ChevronRight, ArrowRight, Sparkles, Globe, CheckCircle2,
  MapPin, Brain, ShieldCheck, Star
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-nature-pattern" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-medium">Gamified Sustainability Learning</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Learn{' '}
                <span className="text-gradient-green">Green.</span>
                <br />
                Act{' '}
                <span className="text-gradient-green">Green.</span>
                <br />
                Make an{' '}
                <span className="relative inline-block">
                  <span className="text-gradient-green">Impact.</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute bottom-1 left-0 h-3 bg-emerald-200/50 -z-10 rounded"
                  />
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Transform your campus into a sustainability hub. Explore interactive learning destinations,
                complete real-world challenges, and earn rewards while building eco-friendly habits.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-emerald-700 rounded-2xl font-semibold text-lg border border-emerald-200 transition-all"
                >
                  Learn More
                  <ChevronRight className="w-5 h-5" />
                </a>
              </motion.div>

              {/* Quick stats */}
              <motion.div variants={fadeInUp} className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">5</p>
                  <p className="text-xs text-gray-500">Learning Worlds</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">25+</p>
                  <p className="text-xs text-gray-500">Quiz Questions</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700">8+</p>
                  <p className="text-xs text-gray-500">Challenges</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 relative z-10">
                  {/* Map preview */}
                  <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-2xl p-6 mb-6">
                    <svg viewBox="0 0 400 280" className="w-full" xmlns="http://www.w3.org/2000/svg">
                      {/* Winding Path */}
                      <path
                        d="M50 240 C100 240, 100 180, 150 180 S200 120, 250 120 S300 60, 350 60"
                        fill="none"
                        stroke="#D1FAE5"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="12 6"
                      />

                      {/* Destination 1: Forest */}
                      <g transform="translate(50, 220)">
                        <circle cx="0" cy="0" r="22" fill="#059669" opacity="0.9" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="18">🌲</text>
                        <text x="0" y="38" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="bold">Waste Wisdom</text>
                      </g>

                      {/* Destination 2: Water */}
                      <g transform="translate(150, 160)">
                        <circle cx="0" cy="0" r="22" fill="#0EA5E9" opacity="0.9" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="18">💧</text>
                        <text x="0" y="38" textAnchor="middle" fill="#0369A1" fontSize="10" fontWeight="bold">Water World</text>
                      </g>

                      {/* Destination 3: Energy */}
                      <g transform="translate(250, 100)">
                        <circle cx="0" cy="0" r="22" fill="#F59E0B" opacity="0.9" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="18">⚡</text>
                        <text x="0" y="38" textAnchor="middle" fill="#B45309" fontSize="10" fontWeight="bold">Energy Valley</text>
                      </g>

                      {/* Destination 4: Mobility */}
                      <g transform="translate(180, 50)">
                        <circle cx="0" cy="0" r="20" fill="#8B5CF6" opacity="0.6" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="16">🚲</text>
                        <text x="0" y="34" textAnchor="middle" fill="#6D28D9" fontSize="9" opacity="0.6">Locked</text>
                      </g>

                      {/* Destination 5: Eco Living */}
                      <g transform="translate(350, 40)">
                        <circle cx="0" cy="0" r="20" fill="#EC4899" opacity="0.6" />
                        <text x="0" y="5" textAnchor="middle" fill="white" fontSize="16">🏡</text>
                        <text x="0" y="34" textAnchor="middle" fill="#BE185D" fontSize="9" opacity="0.6">Locked</text>
                      </g>

                      {/* Decorative trees */}
                      <text x="90" y="200" fontSize="14" opacity="0.4">🌳</text>
                      <text x="200" y="150" fontSize="12" opacity="0.3">🌿</text>
                      <text x="310" y="90" fontSize="14" opacity="0.4">🌸</text>
                      <text x="130" y="120" fontSize="10" opacity="0.3">🦋</text>
                    </svg>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Learning Journey</span>
                    <span className="text-sm font-bold text-emerald-600">40%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '40%' }}
                      transition={{ delay: 1.2, duration: 1 }}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full h-3"
                    />
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 z-20"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">XP Earned</p>
                    <p className="text-sm font-bold text-gray-800">+250 XP</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8, duration: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2 z-20"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">New Badge!</p>
                    <p className="text-sm font-bold text-gray-800">Eco Beginner</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-medium">Why Green Campus Connect?</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Sustainability Learning,{' '}
              <span className="text-gradient-green">Reimagined</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 max-w-2xl mx-auto text-lg">
              We combine interactive education with real-world action to create lasting behavioral change.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: MapPin,
                title: 'Interactive Learning Map',
                description: 'Explore 5 beautifully illustrated sustainability destinations on an adventure-style learning journey.',
                color: 'emerald',
              },
              {
                icon: Brain,
                title: 'Smart Quizzes',
                description: 'Test your knowledge with engaging quizzes. Get instant feedback and detailed explanations.',
                color: 'blue',
              },
              {
                icon: Target,
                title: 'Real-World Challenges',
                description: 'Participate in campus sustainability missions. Submit photo evidence and earn rewards.',
                color: 'purple',
              },
              {
                icon: Trophy,
                title: 'Gamification & Rewards',
                description: 'Earn XP, unlock levels, collect badges, and climb the leaderboard as you learn.',
                color: 'amber',
              },
              {
                icon: Users,
                title: 'Campus Community',
                description: 'See how your peers are contributing. Compare progress on the sustainability leaderboard.',
                color: 'rose',
              },
              {
                icon: ShieldCheck,
                title: 'Verified Impact',
                description: 'All challenge submissions are reviewed by administrators to ensure genuine participation.',
                color: 'teal',
              },
            ].map((feature, index) => {
              const colorMap = {
                emerald: 'bg-emerald-100 text-emerald-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                amber: 'bg-amber-100 text-amber-600',
                rose: 'bg-rose-100 text-rose-600',
                teal: 'bg-teal-100 text-teal-600',
              };

              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-lg group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-medium">Simple & Engaging</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It <span className="text-gradient-green">Works</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              { step: '01', icon: BookOpen, title: 'Explore & Learn', desc: 'Navigate the learning map and study sustainability topics at each destination.' },
              { step: '02', icon: Brain, title: 'Take Quizzes', desc: 'Complete quizzes to test your understanding and unlock the next destination.' },
              { step: '03', icon: Target, title: 'Join Challenges', desc: 'Participate in real-world campus challenges and submit photo evidence.' },
              { step: '04', icon: Trophy, title: 'Earn Rewards', desc: 'Collect XP, badges, and climb the leaderboard. Track your green impact!' },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center relative">
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-emerald-200" />
                )}

                <div className="relative z-10 mb-4 inline-flex">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto">
                    <item.icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== SUSTAINABILITY TOPICS ===== */}
      <section id="topics" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-medium">5 Learning Destinations</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Featured <span className="text-gradient-green">Sustainability Topics</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600 max-w-2xl mx-auto">
              Each destination covers a critical area of campus sustainability with interactive content and quizzes.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {[
              {
                icon: '🌲',
                title: 'Forest of Waste Wisdom',
                topics: ['Waste Segregation', 'Recycling', 'Composting', 'Plastic Pollution'],
                gradient: 'from-emerald-500 to-green-600',
                lightBg: 'bg-emerald-50',
              },
              {
                icon: '💧',
                title: 'Water World',
                topics: ['Water Conservation', 'Water Pollution', 'Rainwater Harvesting', 'Responsible Use'],
                gradient: 'from-cyan-500 to-blue-600',
                lightBg: 'bg-blue-50',
              },
              {
                icon: '⚡',
                title: 'Energy Valley',
                topics: ['Energy Conservation', 'Renewable Energy', 'Electricity Efficiency'],
                gradient: 'from-amber-500 to-orange-600',
                lightBg: 'bg-amber-50',
              },
              {
                icon: '🚲',
                title: 'Green Mobility Trail',
                topics: ['Walking & Cycling', 'Public Transport', 'Carbon Emissions'],
                gradient: 'from-violet-500 to-purple-600',
                lightBg: 'bg-purple-50',
              },
              {
                icon: '🏡',
                title: 'Eco Living Island',
                topics: ['Responsible Consumption', 'Sustainable Purchasing', 'Reuse & Repair'],
                gradient: 'from-pink-500 to-rose-600',
                lightBg: 'bg-rose-50',
              },
            ].map((dest, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className={`bg-gradient-to-br ${dest.gradient} p-6 text-center`}>
                  <span className="text-4xl">{dest.icon}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm leading-tight">{dest.title}</h3>
                  <ul className="space-y-1.5">
                    {dest.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== GAMIFICATION ===== */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700/50 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-200 text-sm font-medium">Gamification</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">
              Learn, Play & <span className="text-emerald-300">Grow</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-emerald-200 max-w-2xl mx-auto">
              Every action earns you experience points. Level up, collect badges, and compete with your peers.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Star, label: 'XP Points', desc: 'Earn XP for completing modules, quizzes, and challenges', value: 'Up to 500' },
              { icon: TrendingUp, label: 'Levels', desc: 'Level up as you accumulate XP. Track your growth', value: 'Unlimited' },
              { icon: Award, label: 'Badges', desc: 'Collect unique badges for achievements like Eco Beginner', value: '6+ Badges' },
              { icon: Trophy, label: 'Leaderboard', desc: 'Compete with classmates. See who is the greenest!', value: 'Campus-wide' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-emerald-800/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-700/50 hover:border-emerald-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-700/50 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-300" />
                </div>
                <p className="text-2xl font-bold text-emerald-300 mb-1">{item.value}</p>
                <h3 className="text-lg font-semibold text-white mb-2">{item.label}</h3>
                <p className="text-emerald-200 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section id="impact" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 text-sm font-medium">Platform Statistics</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-gradient-green">Green Impact</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-500 text-sm max-w-xl mx-auto">
              Illustrative sample data showing the platform&#39;s potential reach. Actual figures will vary based on campus participation.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Users, value: '500+', label: 'Students Engaged', sub: 'Sample target' },
              { icon: BookOpen, value: '5', label: 'Learning Destinations', sub: 'Sustainability topics' },
              { icon: Target, value: '8+', label: 'Active Challenges', sub: 'Real-world missions' },
              { icon: Award, value: '6', label: 'Achievement Badges', sub: 'Collectible rewards' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white rounded-2xl p-8 text-center card-shadow hover:card-shadow-hover transition-all"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-700 font-medium text-sm">{stat.label}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Make Your Campus Greener?
                </h2>
                <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                  Join the sustainability movement. Start learning, take action, and earn rewards today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-semibold text-lg hover:bg-emerald-50 transition-all hover:shadow-xl"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white rounded-2xl font-semibold text-lg border border-emerald-500 hover:bg-emerald-600 transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
