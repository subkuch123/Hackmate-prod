import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, User, MessageSquare, Send, MapPin } from 'lucide-react';

import emailjs from 'emailjs-com';
import { Link } from 'react-router-dom';

const teamPhoto = "src/assets/group_pic.png";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // ✅ EmailJS Credentials - ये अपने credentials से replace करें
      const SERVICE_ID = 'service_14mbyk1'; // अपना service ID डालें
      const TEMPLATE_ID = 'template_i5d1q0n'; // अपना template ID डालें
      const PUBLIC_KEY = 'yWykJG3r8PVfgLQ79'; // अपना public key डालें
      
      // Template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
        to_email: 'hackmate.17@gmail.com',
        to_name: 'Hackmate Team',
        reply_to: formData.email,
        subject: `New Contact Form Submission from ${formData.name}`,
        date: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'medium',
          timeStyle: 'short'
        })
      };
      
      // Email भेजें
      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      
      console.log('✅ Email sent successfully:', response.status, response.text);
      
      // Success state
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error sending email:', error);
      
      // Fallback to mailto if EmailJS fails
      const subject = `Contact Form - ${formData.name}`;
      const body = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Message:
${formData.message}

---
Sent from Hackmate Contact Form
      `.trim();
      
      const mailtoLink = `mailto:hackmate.17@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
      
      // Even with fallback, show success
      setSubmitSuccess(true);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    }
  };

  // Photo error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Have questions about Hackmate? Want to collaborate? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Team Photo */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
              <img 
                src={teamPhoto} 
                alt="Hackmate Team" 
                className="w-full h-70 object-cover"
                onError={handleImageError}
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">Meet Our Team</h3>
                <p className="text-gray-400">
                  We're a passionate group of developers, designers, and innovators building the future of collaborative coding.
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
              <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Direct Email</h4>
                    <a 
                      href="mailto:hackmate.17@gmail.com" 
                      className="text-gray-400 hover:text-cyan-400 transition-colors block"
                    >
                      hackmate.17@gmail.com
                    </a>
                    <a 
                      href="mailto:team@hackmate.codes" 
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      team@hackmate.codes
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Location</h4>
                    <p className="text-gray-400">DLF Down Town, Commercial Site Block 2, DLF City Phase 1 Rd, Sector 25</p>
                    <p className="text-gray-400 text-sm">Gurugram, Haryana 122002, India</p>
                  </div>
                </div>
                 <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-gray-400">+91 (98716-28091)</p>
                    {/* <p className="text-gray-400 text-sm">Based with developers worldwide</p> */}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8"
          >
            <h2 className="text-3xl font-bold mb-1">Send us a Message</h2>
            <p className="text-gray-400 mb-8">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" />
                    Full Name *
                  </div>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-400" />
                    Email Address *
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" />
                    Phone Number (Optional)
                  </div>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+91 (98716-28091)"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Your Message *
                  </div>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your project, question, or collaboration idea..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-6 rounded-xl font-semibold text-l transition-all flex items-center justify-center gap-3 ${
                  isSubmitting 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>

              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400"
                >
                  <div className="font-bold mb-1">✓ Form Submitted!</div>
                  <div className="text-sm">
                    Your email client should open automatically. If not, please email us directly at{' '}
                    <a href="mailto:hackmate.17@gmail.com" className="underline">hackmate.17@gmail.com</a>
                  </div>
                </motion.div>
              )}

              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400"
                >
                  <div className="font-bold mb-1">⚠️ Error</div>
                  <div className="text-sm">{submitError}</div>
                  <div className="mt-2 text-sm">
                    Please email us directly at{' '}
                    <a href="mailto:hackmate.17@gmail.com" className="underline">hackmate.17@gmail.com</a>
                  </div>
                </motion.div>
              )}

              <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Our team will contact you via the email you provided within 1 business day.
                </p>
              </div>

              <p className="text-gray-500 text-sm text-center pt-1">
                * Required fields. Your data is protected by our{' '}
                <Link to="/privacy" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </motion.div>
        </div>

        {/* Direct Email Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Prefer to Email Directly?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="mailto:hackmate.17@gmail.com"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 rounded-xl font-semibold text-lg transition-all flex items-center gap-3"
              >
                <Mail className="w-5 h-5" />
                Email hackmate.17@gmail.com
              </a>
              <p className="text-gray-400">or</p>
              <a
                href="mailto:team@hackmate.codes"
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold text-lg transition-all flex items-center gap-3"
              >
                <Mail className="w-5 h-5" />
                Email team@hackmate.codes
              </a>
            </div>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
};

export default ContactUs;