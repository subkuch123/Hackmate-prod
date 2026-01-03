// components/HackathonFeedbackForm.tsx
import React, { useState } from "react";
import { HackathonFeedback } from "../../types/feedback";

const HackathonFeedbackForm: React.FC = () => {
  const [formData, setFormData] = useState<HackathonFeedback>({
    participantInfo: {
      name: "",
      email: "",
      teamName: "",
      role: "hacker",
      hackathonExperience: "first-time",
    },
    overallExperience: {
      rating: 5,
      wouldRecommend: 5,
      highlights: [],
      biggestDisappointments: [],
      memorableMoments: "",
    },
    websiteExperience: {
      uiRating: 5,
      uxRating: 5,
      navigationIssues: [],
      mobileExperience: "good",
      suggestions: "",
    },
    problemStatements: {
      clarity: 5,
      relevance: 5,
      diversity: 5,
      difficulty: "just-right",
      favoriteTracks: [],
      improvements: "",
    },
    eventOrganization: {
      scheduleRating: 5,
      venueRating: 5,
      foodRating: 5,
      swagRating: 5,
      communication: 5,
      checkinProcess: "okay",
    },
    technicalAspects: {
      wifiQuality: 5,
      powerAvailability: 5,
      workspaceComfort: 5,
      hardwareAvailability: "",
      technicalSupport: 5,
    },
    mentorship: {
      availability: 5,
      quality: 5,
      expertise: 5,
      mentorSuggestions: "",
    },
    judgingProcess: {
      fairness: 5,
      clarity: 5,
      feedbackQuality: 5,
      prizeDistribution: 5,
      judgingSuggestions: "",
    },
    workshops: {
      quality: 5,
      relevance: 5,
      timing: 5,
      favoriteWorkshops: [],
      workshopSuggestions: "",
    },
    networking: {
      opportunities: 5,
      sponsorInteraction: 5,
      teamFormation: 5,
      communityVibe: "good",
    },
    challenges: {
      technical: [],
      organizational: [],
      personal: [],
      team: [],
      biggestChallenge: "",
      howOvercome: "",
    },
    suggestions: {
      immediateImprovements: [],
      longTermSuggestions: [],
      dreamFeatures: [],
      wouldReturn: "probably",
      additionalComments: "",
    },
    demographics: {
      ageRange: "18-24",
      education: "undergraduate",
      background: "",
      location: "",
    },
  });

  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    "Personal Info",
    "Overall Experience",
    "Website & UI/UX",
    "Problem Statements",
    "Event Organization",
    "Technical Aspects",
    "Mentorship",
    "Judging & Prizes",
    "Workshops",
    "Networking",
    "Challenges Faced",
    "Suggestions",
    "Demographics",
  ];

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof HackathonFeedback],
        [field]: value,
      },
    }));
  };

  const handleArrayUpdate = (
    section: string,
    field: string,
    value: string,
    action: "add" | "remove"
  ) => {
    setFormData((prev) => {
      const currentArray = prev[section as keyof HackathonFeedback][
        field as keyof (typeof prev)[keyof HackathonFeedback]
      ] as string[];
      let newArray = [...currentArray];

      if (action === "add" && value.trim()) {
        newArray.push(value.trim());
      } else if (action === "remove") {
        newArray = newArray.filter((item) => item !== value);
      }

      return {
        ...prev,
        [section]: {
          ...prev[section as keyof HackathonFeedback],
          [field]: newArray,
        },
      };
    });
  };

  const RatingSlider = ({ label, value, onChange, section, field }: any) => (
    <div className="glass-card p-4 mb-4">
      <label className="block text-sm font-orbitron text-cyan-400 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-purple-300 w-16">1 (Poor)</span>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(section, field, parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-neon"
        />
        <span className="text-xs text-purple-300 w-16">10 (Excellent)</span>
      </div>
      <div className="text-center mt-2">
        <span className="text-lg font-orbitron text-cyan-300">{value}/10</span>
      </div>
    </div>
  );

  const TagInput = ({
    label,
    tags,
    onAddTag,
    onRemoveTag,
    placeholder,
  }: any) => {
    const [input, setInput] = useState("");

    const handleAdd = () => {
      if (input.trim()) {
        onAddTag(input.trim());
        setInput("");
      }
    };

    return (
      <div className="glass-card p-4 mb-4">
        <label className="block text-sm font-orbitron text-cyan-400 mb-2">
          {label}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-900/50 text-purple-200 border border-purple-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-2 text-purple-400 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAdd())
            }
            placeholder={placeholder}
            className="flex-1 bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors font-orbitron text-sm"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-orbitron text-cyan-300 mb-6">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.participantInfo.name}
                  onChange={(e) =>
                    handleInputChange("participantInfo", "name", e.target.value)
                  }
                  className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="glass-card p-4">
                <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.participantInfo.email}
                  onChange={(e) =>
                    handleInputChange(
                      "participantInfo",
                      "email",
                      e.target.value
                    )
                  }
                  className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="glass-card p-4">
                <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.participantInfo.teamName}
                  onChange={(e) =>
                    handleInputChange(
                      "participantInfo",
                      "teamName",
                      e.target.value
                    )
                  }
                  className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="Your team name (if applicable)"
                />
              </div>

              <div className="glass-card p-4">
                <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                  Your Role *
                </label>
                <select
                  value={formData.participantInfo.role}
                  onChange={(e) =>
                    handleInputChange("participantInfo", "role", e.target.value)
                  }
                  className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="hacker">Hacker</option>
                  <option value="mentor">Mentor</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="organizer">Organizer</option>
                  <option value="judge">Judge</option>
                  <option value="sponsor">Sponsor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="glass-card p-4 md:col-span-2">
                <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                  Hackathon Experience Level *
                </label>
                <select
                  value={formData.participantInfo.hackathonExperience}
                  onChange={(e) =>
                    handleInputChange(
                      "participantInfo",
                      "hackathonExperience",
                      e.target.value
                    )
                  }
                  className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="first-time">First Time</option>
                  <option value="1-3">1-3 Hackathons</option>
                  <option value="4-6">4-6 Hackathons</option>
                  <option value="7+">7+ Hackathons</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Overall Experience
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-orbitron text-cyan-300 mb-6">
              Overall Experience
            </h3>

            <RatingSlider
              label="Overall Rating"
              value={formData.overallExperience.rating}
              onChange={handleInputChange}
              section="overallExperience"
              field="rating"
            />

            <RatingSlider
              label="How likely would you recommend this hackathon to others?"
              value={formData.overallExperience.wouldRecommend}
              onChange={handleInputChange}
              section="overallExperience"
              field="wouldRecommend"
            />

            <TagInput
              label="Event Highlights"
              tags={formData.overallExperience.highlights}
              onAddTag={(tag: string) =>
                handleArrayUpdate("overallExperience", "highlights", tag, "add")
              }
              onRemoveTag={(tag: string) =>
                handleArrayUpdate(
                  "overallExperience",
                  "highlights",
                  tag,
                  "remove"
                )
              }
              placeholder="Add highlights (e.g., Opening ceremony, workshops, etc.)"
            />

            <TagInput
              label="Areas for Improvement"
              tags={formData.overallExperience.biggestDisappointments}
              onAddTag={(tag: string) =>
                handleArrayUpdate(
                  "overallExperience",
                  "biggestDisappointments",
                  tag,
                  "add"
                )
              }
              onRemoveTag={(tag: string) =>
                handleArrayUpdate(
                  "overallExperience",
                  "biggestDisappointments",
                  tag,
                  "remove"
                )
              }
              placeholder="Add disappointing aspects"
            />

            <div className="glass-card p-4">
              <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                Most Memorable Moment
              </label>
              <textarea
                value={formData.overallExperience.memorableMoments}
                onChange={(e) =>
                  handleInputChange(
                    "overallExperience",
                    "memorableMoments",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="Share your most memorable moment from the hackathon..."
              />
            </div>
          </div>
        );

      case 2: // Website & UI/UX
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-orbitron text-cyan-300 mb-6">
              Website & User Experience
            </h3>

            <RatingSlider
              label="Website UI Design Rating"
              value={formData.websiteExperience.uiRating}
              onChange={handleInputChange}
              section="websiteExperience"
              field="uiRating"
            />

            <RatingSlider
              label="Website UX (Usability) Rating"
              value={formData.websiteExperience.uxRating}
              onChange={handleInputChange}
              section="websiteExperience"
              field="uxRating"
            />

            <div className="glass-card p-4 mb-4">
              <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                Mobile Experience
              </label>
              <select
                value={formData.websiteExperience.mobileExperience}
                onChange={(e) =>
                  handleInputChange(
                    "websiteExperience",
                    "mobileExperience",
                    e.target.value
                  )
                }
                className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
                <option value="terrible">Terrible</option>
              </select>
            </div>

            <TagInput
              label="Navigation Issues Encountered"
              tags={formData.websiteExperience.navigationIssues}
              onAddTag={(tag: string) =>
                handleArrayUpdate(
                  "websiteExperience",
                  "navigationIssues",
                  tag,
                  "add"
                )
              }
              onRemoveTag={(tag: string) =>
                handleArrayUpdate(
                  "websiteExperience",
                  "navigationIssues",
                  tag,
                  "remove"
                )
              }
              placeholder="Add navigation problems you faced"
            />

            <div className="glass-card p-4">
              <label className="block text-sm font-orbitron text-cyan-400 mb-2">
                Website Improvement Suggestions
              </label>
              <textarea
                value={formData.websiteExperience.suggestions}
                onChange={(e) =>
                  handleInputChange(
                    "websiteExperience",
                    "suggestions",
                    e.target.value
                  )
                }
                rows={4}
                className="w-full bg-gray-800/50 border border-cyan-500/30 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                placeholder="What would make the website better?"
              />
            </div>
          </div>
        );

      // Add more cases for other sections following the same pattern...

      default:
        return (
          <div className="text-center py-8">
            <h3 className="text-xl font-orbitron text-cyan-300 mb-4">
              Section {currentSection + 1}
            </h3>
            <p className="text-gray-400">
              This section is under construction...
            </p>
          </div>
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    alert(
      "Thank you for your feedback! The HackForce team appreciates your input."
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron text-cyan-300 mb-4 animate-pulse">
            HACKFORCE FEEDBACK PORTAL
          </h1>
          <p className="text-purple-200 text-lg">
            Help us improve the hackathon experience for everyone
          </p>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-orbitron text-cyan-400">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm text-purple-300">
              {Math.round(((currentSection + 1) / sections.length) * 100)}%
              Complete
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass-card p-4 mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`px-4 py-2 rounded-lg text-sm font-orbitron transition-all ${
                  currentSection === index
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-6">
          {renderSection()}
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
            disabled={currentSection === 0}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg font-orbitron transition-colors"
          >
            Previous
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              type="button"
              onClick={() =>
                setCurrentSection((prev) =>
                  Math.min(sections.length - 1, prev + 1)
                )
              }
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-orbitron transition-colors neon-glow-hover"
            >
              Next Section
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-orbitron transition-colors neon-glow-hover"
            >
              Submit Feedback
            </button>
          )}
        </div>
      </div>

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider-neon::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .slider-neon::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #06b6d4, #8b5cf6);
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
};

export default HackathonFeedbackForm;
