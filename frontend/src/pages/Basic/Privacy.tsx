import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Mail } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const [read, setRead] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-1">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">
            At Hackmate.codes, we recognize that privacy is fundamental.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: December 2025 • Version 2.1.0
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-8">
          
          {/* Introduction */}
          <div className="mb-10">
            <p className="text-gray-300 leading-relaxed mb-4">
              At Hackmate.codes, we recognize that privacy is fundamental. This Privacy Policy applies to the use of our website, content, and all services offered by Hackmate.codes. Where additional details are necessary to explain our practices for specific services, we provide supplementary privacy notices alongside those services.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us at team@hackmate.codes or hackmate.17@gmail.com.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This policy describes how Hackmate.codes (also referred to as "Hackmate," "we," "our," or "us") handles your data when you use https://hackmate.codes/ ("the Platform").
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              The Platform is a gamified engagement, collaboration, and project-hosting technology platform that enables users to build, share, and participate in coding projects, hackathons, and developer events.
            </p>
          </div>

          {/* Scope */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Scope</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              This policy applies to Hackmate.codes' content, products, services, and websites.
            </p>
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy does not apply to the practices of third-party companies, platforms, or individuals that Hackmate.codes does not own, control, or manage.
            </p>
          </div>

          {/* Definitions */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Definitions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-400">Users</h3>
                <p className="text-gray-300">– Individuals or teams registered on the Platform to create, collaborate on, or participate in projects, hackathons, and events.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-purple-400">Projects / Events</h3>
                <p className="text-gray-300">– Public or private coding challenges, hackathons, workshops, or collaborative developer activities hosted on the Platform.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-green-400">Project Content</h3>
                <p className="text-gray-300">– Any content related to a project or event, including code, documentation, messages, files, presentations, or multimedia shared or submitted through the Platform.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-amber-400">Clients / Organizers</h3>
                <p className="text-gray-300">– Companies, institutions, or individuals who use the Platform to host and manage events, hackathons, or team-based coding activities.</p>
              </div>
            </div>
          </div>

          {/* Information Collection and Use */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Information Collection and Use</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To provide our services, we may collect the following types of information when you register or interact with the Platform:
            </p>
            <ul className="space-y-3 ml-6 text-gray-300">
              <li className="list-disc">Name, email address, profile picture, username, location, and contact details.</li>
              <li className="list-disc">Educational or professional background, skills, and interests.</li>
              <li className="list-disc">Technical data such as IP address, device ID, browser type, operating system, and usage behavior.</li>
              <li className="list-disc">Content you create, submit, or share during projects, hackathons, or collaborations.</li>
              <li className="list-disc">Payment details (if you purchase platform access, event tickets, or subscriptions).</li>
              <li className="list-disc">Communication preferences and consents.</li>
              <li className="list-disc">Photographs or video recordings (e.g., for project submissions or participant verification).</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              We may also receive information from third parties, such as social login providers (GitHub, Google, etc.), in accordance with their privacy policies and your permissions.
            </p>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use your personal information to:
            </p>
            <ul className="space-y-2 ml-6 text-gray-300">
              <li className="list-disc">Provide, personalize, and improve our services.</li>
              <li className="list-disc">Facilitate collaboration and communication between users.</li>
              <li className="list-disc">Send service updates, security alerts, and support messages.</li>
              <li className="list-disc">Notify you about events, projects, or opportunities matching your interests.</li>
              <li className="list-disc">Analyze platform usage to enhance user experience.</li>
              <li className="list-disc">Ensure platform security and prevent misuse.</li>
            </ul>
          </div>

          {/* Information Sharing and Disclosure */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information only:
            </p>
            <ul className="space-y-2 ml-6 text-gray-300">
              <li className="list-disc">With your explicit consent.</li>
              <li className="list-disc">To provide a service you've requested (e.g., sharing your submission with event organizers).</li>
              <li className="list-disc">With trusted service partners who assist in platform operations (under strict confidentiality).</li>
              <li className="list-disc">If required by law, regulatory authorities, or legal processes.</li>
              <li className="list-disc">To protect the rights, safety, or property of Hackmate.codes, our users, or the public.</li>
            </ul>
          </div>

          {/* Withdrawing Consent */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Withdrawing Consent</h2>
            <p className="text-gray-300">
              You may withdraw consent for marketing or non-essential communications at any time by using the unsubscribe link in our emails or contacting us at team@hackmate.codes.
            </p>
          </div>

          {/* Cookies */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and support platform functionality. You can manage cookie preferences through your browser settings, though this may affect certain platform features.
            </p>
            <p className="text-gray-300">
              Third-party cookies may be used for analytics and advertising in accordance with their respective privacy policies.
            </p>
          </div>

          {/* External Links */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">External Links</h2>
            <p className="text-gray-300">
              Our Platform may contain links to third-party websites. We are not responsible for their privacy practices, and we encourage you to review their policies.
            </p>
          </div>

          {/* Security */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Security</h2>
            <p className="text-gray-300">
              We implement appropriate technical and organizational measures to protect your data. Your account is secured with password protection, and we regularly review our security practices.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy periodically. We will notify users of significant changes via the Platform or email. Continued use of Hackmate.codes after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Your Rights */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="space-y-2 ml-6 text-gray-300 mb-4">
              <li className="list-disc">Access, correct, or delete your personal data.</li>
              <li className="list-disc">Restrict or object to certain data processing.</li>
              <li className="list-disc">Receive your data in a portable format.</li>
              <li className="list-disc">Lodge a complaint with a supervisory authority.</li>
            </ul>
            <p className="text-gray-300">
              To exercise these rights, contact team@hackmate.codes. Please note that certain data may be retained where required by law or for legitimate business purposes.
            </p>
          </div>

          {/* Data Retention */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We retain your personal data as long as your account is active or as needed to provide services. Inactive accounts may be archived or deleted after five (5) years. Data related to projects or events may be retained for up to three (3) years unless otherwise requested by the organizer or user.
            </p>
            <p className="text-gray-300">
              Marketing data is retained until you opt out, after which we maintain a minimal record to respect your preferences.
            </p>
          </div>

          {/* Account Deletion */}
          <div className="mb-1 bg-gradient-to-r from-red-900/20 to-transparent border border-red-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3 text-red-300">Account Deletion</h2>
            <p className="text-gray-300">
              To delete your account, email team@hackmate.codes from your registered email address. We will process your request in accordance with applicable laws and platform requirements.
            </p>
          </div>

          {/* Consent Checkbox */}
          {/* <div className="border-t border-gray-700 pt-8 mt-8">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setRead(!read)}
                className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-1 ${
                  read ? 'bg-green-500' : 'bg-gray-700 border border-gray-600'
                }`}
              >
                {read && <Check className="w-4 h-4 text-white" />}
              </button>
              <div>
                <h3 className="text-lg font-semibold mb-2">Acknowledgement</h3>
                <p className="text-gray-400">
                  By checking this box, I acknowledge that I have read and understood the Privacy Policy 
                  and how Hackmate.codes handles my personal information.
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Contact Info */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Questions?</h3>
            <p className="text-gray-400">Contact our privacy team for clarification</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a
    href="mailto:team@hackmate.codes"
    className="flex items-center justify-center gap-3 px-6 py-4 "
  >
    <Mail className="w-5 h-5 text-blue-400" />
    <span className=" font-medium">team@hackmate.codes</span>
  </a>
  <a
    href="mailto:hackmate.17@gmail.com"
    className="flex items-center justify-center gap-3 px-6 py-4 "
  >
    <Mail className="w-5 h-5 text-purple-400" />
    <span className=" font-medium">hackmate.17@gmail.com</span>
  </a>
          </div>
        </div>

        {/* Navigation Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/terms')}
            className="flex-1 py-4 px-6 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
          >
            View Terms & Conditions
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90 rounded-xl font-semibold text-lg transition-all"
          >
            Back to Home
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default PrivacyPolicy;