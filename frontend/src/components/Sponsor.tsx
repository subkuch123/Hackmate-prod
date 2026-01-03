import React from "react";
import wayspire from "@/assets/wayspire.png";
import logointibuddy from "@/assets/logointibuddy.png";
import logo from "@/assets/logo.svg";
import aops from  "@/assets/aops.svg";
import mycerti from "@/assets/mycerti.png";
import logocraft from "@/assets/logocraft.png";

const sponsors = [
  {
    name: "Interview Buddy",
    logo: logointibuddy,
  },
  {
    name: "Wayspire",
    logo: wayspire,
  },
  {
    name: "Balamiq",
    logo: logo,
  },
  {
    name: "Aops-online",
    logo: aops,
  },
  {
    name: "Give  my certificate",
    logo: mycerti,
  },
  {
    name: "Codecrafters",
    logo: logocraft,
  },
];

export const Sponsor = () => {
  return (
    <section className="relative py-20  overflow-hidden">
      {/* Glow Background */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Our <span className="text-cyan-400">Sponsors</span>
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto mb-12">
          Proudly supported by industry leaders who empower innovation and
          creativity.
        </p>

        {/* Sponsors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-8 place-items-center">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-md rounded-xl p-6 w-full flex items-center justify-center 
              border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="h-12 md:h-28 object-contain  group-hover:grayscale-0 transition duration-300 text-white "
              />

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-cyan-400/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>c
    </section>
  );
};
