// types/feedback.ts
export interface HackathonFeedback {
  // Personal Information
  participantInfo: {
    name: string;
    email: string;
    teamName: string;
    role: 'hacker' | 'mentor' | 'volunteer' | 'organizer' | 'judge' | 'sponsor' | 'other';
    hackathonExperience: 'first-time' | '1-3' | '4-6' | '7+';
  };

  // Overall Experience
  overallExperience: {
    rating: number; // 1-10
    wouldRecommend: number; // 1-10
    highlights: string[];
    biggestDisappointments: string[];
    memorableMoments: string;
  };

  // Website & Registration
  websiteExperience: {
    uiRating: number; // 1-10
    uxRating: number; // 1-10
    navigationIssues: string[];
    mobileExperience: 'excellent' | 'good' | 'average' | 'poor' | 'terrible';
    suggestions: string;
  };

  // Problem Statements & Challenges
  problemStatements: {
    clarity: number; // 1-10
    relevance: number; // 1-10
    diversity: number; // 1-10
    difficulty: 'too-easy' | 'just-right' | 'challenging' | 'too-hard';
    favoriteTracks: string[];
    improvements: string;
  };

  // Event Organization
  eventOrganization: {
    scheduleRating: number; // 1-10
    venueRating: number; // 1-10
    foodRating: number; // 1-10
    swagRating: number; // 1-10
    communication: number; // 1-10
    checkinProcess: 'smooth' | 'okay' | 'chaotic' | 'terrible';
  };

  // Technical & Logistics
  technicalAspects: {
    wifiQuality: number; // 1-10
    powerAvailability: number; // 1-10
    workspaceComfort: number; // 1-10
    hardwareAvailability: string;
    technicalSupport: number; // 1-10
  };

  // Mentorship & Support
  mentorship: {
    availability: number; // 1-10
    quality: number; // 1-10
    expertise: number; // 1-10
    mentorSuggestions: string;
  };

  // Judging & Prizes
  judgingProcess: {
    fairness: number; // 1-10
    clarity: number; // 1-10
    feedbackQuality: number; // 1-10
    prizeDistribution: number; // 1-10
    judgingSuggestions: string;
  };

  // Workshops & Sessions
  workshops: {
    quality: number; // 1-10
    relevance: number; // 1-10
    timing: number; // 1-10
    favoriteWorkshops: string[];
    workshopSuggestions: string;
  };

  // Networking & Community
  networking: {
    opportunities: number; // 1-10
    sponsorInteraction: number; // 1-10
    teamFormation: number; // 1-10
    communityVibe: 'excellent' | 'good' | 'average' | 'poor' | 'toxic';
  };

  // Challenges Faced
  challenges: {
    technical: string[];
    organizational: string[];
    personal: string[];
    team: string[];
    biggestChallenge: string;
    howOvercome: string;
  };

  // Suggestions & Improvements
  suggestions: {
    immediateImprovements: string[];
    longTermSuggestions: string[];
    dreamFeatures: string[];
    wouldReturn: 'definitely' | 'probably' | 'unsure' | 'probably-not' | 'never';
    additionalComments: string;
  };

  // Demographic Info (Optional)
  demographics: {
    ageRange: 'under-18' | '18-24' | '25-34' | '35-44' | '45-plus';
    education: 'high-school' | 'undergraduate' | 'graduate' | 'professional' | 'other';
    background: string;
    location: string;
  };
}