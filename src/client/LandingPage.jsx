// src/components/LandingPage.jsx
import { motion } from "framer-motion";
import { Wallet, TrendingUp, BarChart } from "lucide-react";

export default function LandingPage({ onLaunch }) {
  const features = [
    {
      icon: Wallet,
      title: "Virtual Wallet",
      desc: "Start with ₹1,00,000 to trade without risk.",
    },
    {
      icon: TrendingUp,
      title: "Live Market Data",
      desc: "Real-time prices of Nifty, Bank Nifty & top stocks.",
    },
    {
      icon: BarChart,
      title: "Track Performance",
      desc: "See profit/loss, wallet balance, and portfolio details.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#111827] via-[#1f2937] to-black text-white font-sans relative">
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 text-center overflow-hidden">
        {/* App Name */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-7xl md:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
        >
          TradeTrack
        </motion.h1>

        {/* Main Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Master Stock Trading — Risk-Free
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-lg max-w-xl mb-8"
        >
          Learn to invest smartly with live market prices. Practice, track, and grow — all virtually.
        </motion.p>

        <motion.button
          onClick={() => onLaunch?.()}
          whileHover={{ scale: 1.05 }}
          className="z-20 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white font-semibold transition"
        >
          Launch Dashboard
        </motion.button>

        {/* SVG Wave Background */}
        <svg
          className="absolute bottom-0 w-full z-0 pointer-events-none"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#8b5cf6" fillOpacity="0.5">
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,160L60,149.3C120,139,240,117,360,106.7C480,96,600,96,720,106.7C840,117,960,139,1080,138.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L0,320Z;
                M0,180L60,160C120,140,240,100,360,90C480,80,600,110,720,120C840,130,960,100,1080,120C1200,140,1320,170,1380,160L1440,150L1440,320L0,320Z;
                M0,160L60,149.3C120,139,240,117,360,106.7C480,96,600,96,720,106.7C840,117,960,139,1080,138.7C1200,139,1320,117,1380,106.7L1440,96L1440,320L0,320Z
              "
            />
          </path>
        </svg>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Why Use TradeTrack?</h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-md text-center"
            >
              <feature.icon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white text-sm text-center py-6">
        © 2025 TradeTrack. Built with ❤️ By Abhiranjan Kumar.
      </footer>
    </div>
  );
}
