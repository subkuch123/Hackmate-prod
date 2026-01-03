import React, { useState, useRef } from 'react';
import { Download, Copy, Share2, Shuffle, Sparkles, Zap } from 'lucide-react';

const HackMateBadgeGenerator = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'Developer',
    teamName: '',
    tagline: '',
    theme: 'neon'
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [generated, setGenerated] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const roles = ['Developer', 'Designer', 'Innovator', 'AI Enthusiast', 'Full Stack', 'Data Scientist'];
  const themes = [
    { value: 'neon', label: 'Neon', gradient: 'from-purple-600 via-pink-500 to-blue-500' },
    { value: 'cyber', label: 'Cyber', gradient: 'from-cyan-500 via-blue-600 to-purple-600' },
    { value: 'glitch', label: 'Glitch', gradient: 'from-green-400 via-teal-500 to-blue-500' },
    { value: 'anime', label: 'Anime', gradient: 'from-pink-500 via-red-500 to-yellow-500' }
  ];

  const captions = [
    `Just joined #HackMate2025 — where strangers become teammates and ideas become reality 💻⚡`,
    `Excited to be part of HackMate! Ready to code, create, and win amazing rewards 🚀`,
    `Let's hack the future together! #HackMate #Innovation #Hackathon #TeamWork`,
    `Proud to join HackMate — AI, anime, and adrenaline in one event 😎🔥`,
    `My HackMate ID just dropped 👀 Ready to build something amazing! #HackMate2025`,
    `Show off your HackMate Badge 🔥 Join the revolution! #HackMate #Coding`
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (formData.name) {
      setGenerated(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const handleDownload = async () => {
    const card = cardRef.current;
    if (!card) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2;
      
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      ctx.scale(scale, scale);

      const gradient = ctx.createLinearGradient(0, 0, card.offsetWidth, card.offsetHeight);
      const selectedTheme = themes.find(t => t.value === formData.theme);
      
      if (formData.theme === 'neon') {
        gradient.addColorStop(0, '#9333ea');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#3b82f6');
      } else if (formData.theme === 'cyber') {
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(0.5, '#2563eb');
        gradient.addColorStop(1, '#9333ea');
      } else if (formData.theme === 'glitch') {
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(0.5, '#14b8a6');
        gradient.addColorStop(1, '#3b82f6');
      } else {
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(0.5, '#ef4444');
        gradient.addColorStop(1, '#eab308');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('HACKMATE', card.offsetWidth / 2, 60);

      ctx.font = 'bold 36px Arial';
      ctx.fillText(formData.name, card.offsetWidth / 2, 200);

      ctx.font = '24px Arial';
      ctx.fillText(formData.role, card.offsetWidth / 2, 240);

      if (formData.teamName) {
        ctx.fillText(`Team: ${formData.teamName}`, card.offsetWidth / 2, 280);
      }

      if (formData.tagline) {
        ctx.font = 'italic 20px Arial';
        ctx.fillText(`"${formData.tagline}"`, card.offsetWidth / 2, 320);
      }

      ctx.font = '18px Arial';
      ctx.fillText('Participant of HackMate 2025', card.offsetWidth / 2, 380);
      ctx.fillText('#HackMate | Join the Revolution', card.offsetWidth / 2, 410);

      const link = document.createElement('a');
      link.download = `HackMate_${formData.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(captions[captionIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shuffleCaption = () => {
    setCaptionIndex((captionIndex + 1) % captions.length);
  };

  const selectedTheme = themes.find(t => t.value === formData.theme);

  return (
    <div className="min-h-screen  text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Generate Your HackMate Card 🎉
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Proudly show the world you're part of the #HackMate2025 revolution! Customize your HackMate card, download it, and flex it on social media.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span>Instant Generation</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <Download className="w-5 h-5 text-green-400" />
            <span>Download HD</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>Share Instantly</span>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleGenerate} className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="space-y-6">
            <div>
              <label className="block text-left text-sm font-medium mb-2">Name / Nickname *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                {roles.map(role => (
                  <option key={role} value={role} className="bg-gray-900">{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-left text-sm font-medium mb-2">Team Name (Optional)</label>
              <input
                type="text"
                value={formData.teamName}
                onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="Team Innovators"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium mb-2">Quote or Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                placeholder="Building the future, one bug at a time"
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium mb-2">Theme Style</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {themes.map(theme => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setFormData({...formData, theme: theme.value})}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      formData.theme === theme.value
                        ? 'border-white bg-white/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`h-2 w-full rounded mb-2 bg-gradient-to-r ${theme.gradient}`}></div>
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-left text-sm font-medium mb-2">Profile Photo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Generate My Badge 🚀
            </button>
          </div>
        </form>

        {/* Generated Card Section */}
        {generated && (
          <div className="max-w-4xl mx-auto mt-16 animate-fadeIn">
            <h2 className="text-4xl font-bold mb-8">Your HackMate Badge is Ready! 🎊</h2>
            
            <div ref={cardRef} className={`relative mx-auto w-full max-w-md h-96 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${selectedTheme.gradient} p-8 flex flex-col items-center justify-center border-4 border-white/20`}>
              <div className="absolute inset-0 bg-black/40"></div>
              
              <div className="relative z-10 text-center">
                {photoUrl && (
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30">
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="mb-2 px-4 py-1 bg-white/20 rounded-full inline-block text-sm font-bold">
                  HACKMATE
                </div>
                
                <h3 className="text-4xl font-bold mb-2">{formData.name}</h3>
                <p className="text-xl mb-2">{formData.role}</p>
                
                {formData.teamName && (
                  <p className="text-lg mb-2">Team: {formData.teamName}</p>
                )}
                
                {formData.tagline && (
                  <p className="text-sm italic mb-4 max-w-xs">"{formData.tagline}"</p>
                )}
                
                <div className="mt-6 space-y-1">
                  <p className="text-sm font-semibold">Participant of HackMate 2025</p>
                  <p className="text-xs">#HackMate | Join the Revolution</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Download className="w-5 h-5" />
                Download Badge
              </button>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Copy className="w-5 h-5" />
                {copied ? 'Copied!' : 'Copy Caption'}
              </button>
              
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://hackmate2025.com')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Share2 className="w-5 h-5" />
                Share on LinkedIn
              </a>
            </div>

            {/* Caption Box */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Your Caption</h3>
                <button
                  onClick={shuffleCaption}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm transition-all"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
              <p className="text-gray-200 text-left">{captions[captionIndex]}</p>
            </div>
          </div>
        )}

        {/* Social Proof */}
        <div className="mt-20 text-center">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-6">
            <p className="text-lg">
              <span className="font-bold text-2xl text-purple-400">2,000+</span> hackers have generated their HackMate badges
            </p>
          </div>
          <p className="text-xl text-gray-300 mb-8">Join the movement!</p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30">
          <h2 className="text-3xl font-bold mb-4">Haven't registered yet?</h2>
          <p className="text-lg text-gray-300 mb-6">Don't miss your chance to be part of HackMate 2025!</p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-bold text-lg transition-all transform hover:scale-105">
            Register for HackMate 2025 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HackMateBadgeGenerator;