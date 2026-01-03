import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Users,
  Target,
  Code,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Shuffle,
  Trophy,
  Scale,
  Gift,
  Sparkles,
  Heart,
  Zap,
  Lightbulb,
  UserPlus,
  Star,
  BookOpen,
  GraduationCap,
  Briefcase,
  Clock
} from 'lucide-react';

const About: React.FC = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  // Mission Statement
  const missionStatement = {
    title: "Ending Hackathon Inequality in India",
    description: "HackMate breaks the elite college monopoly in hackathons. We're building a platform where talent from tier-2/3 colleges gets the same recognition, opportunities, and rewards as premium institutes—creating real meritocracy in tech competitions."
  };

  const coreValues = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Bias-Free Competition",
      description: "Blind judging, anonymous submissions, and skill-based evaluation—zero advantage for 'brand name' colleges.",
      color: "text-purple-400"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "For The Underdogs",
      description: "Specifically designed for students from colleges without hackathon culture or industry connections.",
      color: "text-pink-400"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Skill Amplification",
      description: "Our pressure tasks and eliminations push you beyond classroom learning to actual problem-solving.",
      color: "text-green-400"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Real Career Boost",
      description: "Winning isn't just about prizes—it's about internships, job referrals, and building a portfolio that speaks for itself.",
      color: "text-orange-400"
    }
  ];

  // Platform Features
  const features = [
    {
      icon: <Shuffle className="w-10 h-10" />,
      title: "AI Team Formation",
      description: "No team? No problem! Our smart matching algorithm creates balanced, diverse teams randomly to ensure fair play.",
      stats: "100% Bias-Free Teams",
      highlight: false
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: "Pressure Challenges",
      description: "Real-time surprise tasks and mid-event eliminations that test your adaptability under pressure like real industry scenarios.",
      stats: "24+ Hour Challenges",
      highlight: true
    },
    {
      icon: <Trophy className="w-10 h-10" />,
      title: "Guaranteed Rewards",
      description: "Multiple winning categories ensure prizes for innovation, not just overall victory. Cash, internships, swag for many teams.",
      stats: "10+ Winning Teams Per Event",
      highlight: true
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Blind Evaluation",
      description: "Anonymous submissions and college-blind judging ensure your skills are evaluated purely on merit, not institutional reputation.",
      stats: "0% College Bias",
      highlight: false
    }
  ];

  // Success Metrics
  const metrics = [
    {
      value: "4",
      label: "Successful Hackathons",
      icon: <Trophy className="w-6 h-6" />,
      change: "More coming soon",
      color: "text-yellow-400"
    },
    {
      value: "500+",
      label: "Registered Developers",
      icon: <Users className="w-6 h-6" />,
      change: "Early adopters",
      color: "text-blue-400"
    },
    {
      value: "50+",
      label: "Prototypes Built",
      icon: <Code className="w-6 h-6" />,
      change: "In development",
      color: "text-green-400"
    },
    {
      value: "2000+",
      label: "Hours of Coding",
      icon: <Clock className="w-6 h-6" />,
      change: "Community total",
      color: "text-purple-400"
    }
  ];

  // Team Members
  const teamMembers = [
    {
      name: "Ankit Sharma",
      role: "Founder & CEO",
      expertise: "Ex-Google, Stanford CS",
      bio: "Built three ed-tech startups, passionate about democratizing tech education.",
      avatar: "/src/assets/member2.png"
    },
    {
      name: "Dr Tanya Arora",
      role: "Head of Marketing",
      expertise: "Computer Science, MIT",
      bio: "Former enthusiast focused on project-based learning methodologies.",
      avatar: "/src/assets/member1.png"
    },
    {
      name: "Robin Verma",
      role: "CTO",
      expertise: "Ex-Microsoft, System Architecture",
      bio: "Led engineering teams building platforms serving 10M+ users.",
      avatar: "/src/assets/member3.png"
    },
    {
      name: "Priya Sharma",
      role: "Community Director",
      expertise: "Developer Relations Specialist",
      bio: "Built communities at GitHub and Stack Overflow, connecting 50K+ developers.",
      avatar: "/src/assets/member4.png"
    }
  ];

  // Hackathon Tracks
  const hackathonTracks = [
    {
      title: "Web Wizardry",
      duration: "24-48 Hours",
      projects: "Real-time Web Apps",
      difficulty: "Beginner to Advanced",
      color: "border-blue-500/30 bg-blue-500/5",
      icon: "⚡",
      prizes: "₹50K+ Cash Prizes"
    },
    {
      title: "AI Showdown",
      duration: "36-72 Hours",
      projects: "ML/Data Science Solutions",
      difficulty: "Intermediate to Expert",
      color: "border-purple-500/30 bg-purple-500/5",
      icon: "🧠",
      prizes: "Internship Offers + Cash"
    },
    {
      title: "Mobile Madness",
      duration: "24-48 Hours",
      projects: "Cross-Platform Apps",
      difficulty: "Beginner to Advanced",
      color: "border-green-500/30 bg-green-500/5",
      icon: "📱",
      prizes: "App Store Features + Rewards"
    },
    {
      title: "Blockchain Battle",
      duration: "48-72 Hours",
      projects: "DApps & Smart Contracts",
      difficulty: "Advanced",
      color: "border-amber-500/30 bg-amber-500/5",
      icon: "⛓️",
      prizes: "Crypto Rewards + Funding"
    }
  ];

  return (
    <div className="min-h-screen text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              top: `${20 + i * 20}%`,
              left: `${i * 30}%`,
            }}
            animate={{
              x: [0, 100 * (i + 1), 0],
              y: [0, -50 * (i + 1), 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 py-1 sm:py-2 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Transforming Tech Education</span>
            </motion.div>

            <h1 className="text-2xl sm:text-2xl lg:text-5xl font-bold mb-6 leading-tight">
              Where Students Become{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Industry-Ready Developers
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
              Fed up with hackathons that favor "brand name" colleges? HackMate is your equalizer. We've created India's first hackathon platform where your coding skills speak louder than your college tag. No team politics,
              no institutional bias—just pure competition featuring random team formation, intense pressure tasks,
              mid-event eliminations, and real rewards including cash prizes, internships, and swag. This is where underdogs become champions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/lobbies">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2 cursor-pointer"
                >
                  <Rocket className="w-5 h-5" />
                  <span>Start Building Today</span>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Metrics Bar */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
          >
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 text-center group hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-')}/10`}>
                    {metric.icon}
                  </div>
                </div>
                <div className={`text-3xl font-bold mb-1 ${metric.color}`}>{metric.value}</div>
                <div className="text-gray-300 font-medium mb-1">{metric.label}</div>
                <div className="text-sm text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 sm:p-12"
          >
            <div className="flex items-start space-x-4 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Mission</h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {missionStatement.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-2xl border ${value.border} ${value.bg} backdrop-blur-sm`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${value.bg} border ${value.border}`}>
                      <div className={value.color}>{value.icon}</div>
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${value.color}`}>{value.title}</h3>
                      <p className="text-gray-300">{value.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Platform Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Accelerate Your Career
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`p-8 rounded-2xl border ${feature.highlight
                  ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-cyan-500/30'
                  : 'bg-gray-800/30 border-gray-700/50'
                  } backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${feature.highlight ? 'bg-cyan-500/10' : 'bg-gray-700/50'
                    }`}>
                    <div className={feature.highlight ? 'text-cyan-400' : 'text-gray-300'}>
                      {feature.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                      {feature.highlight && (
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <div className="text-sm font-medium text-gray-400">{feature.stats}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
              <GraduationCap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Hackathon Records</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Specialization Track
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hackathonTracks.map((path, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`p-6 rounded-2xl border ${path.color} backdrop-blur-sm`}
              >
                <div className="text-4xl mb-4">{path.icon}</div>
                <h3 className="text-xl font-bold mb-3">{path.title}</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{path.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Award className="w-4 h-4" />
                    <span>{path.projects}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>{path.difficulty}</span>
                  </div>
                </div>
                {/* <button className="w-full mt-6 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors duration-300 text-sm font-medium">
                  Explore Path
                </button> */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Leadership Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Meet The{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Architects of Change
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
              >
                <div className="text-center mb-4">
                  {/* Avatar image container */}
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-cyan-500/30 mb-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                <div class="w-full h-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                  ${member.name.charAt(0)}
                </div>
              `;
                      }}
                    />
                  </div>

                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <div className="text-cyan-400 font-medium mb-2">{member.role}</div>
                  <div className="text-sm text-gray-400 mb-3">{member.expertise}</div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed text-center">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-8 sm:p-12 text-center"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Heart className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Join Our Community</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Transform Your Learning Journey?
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join 15,000+ students who are building real projects, connecting with mentors, 
              and launching their tech careers with HackMate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-gray-600 rounded-xl font-semibold text-lg hover:bg-gray-800/50 transition-all duration-300"
              >
                Schedule a Demo
              </motion.button>
            </div>

            <p className="text-gray-400 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section> */}

    </div>
  );
};

export default About;