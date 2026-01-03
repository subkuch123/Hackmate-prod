// components/GuidelinesModal.jsx
import { X, BookOpen, Users, Code, Shield, Trophy, Clock, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GuidelinesModal = ({ isOpen, onClose }) => {
    const guidelines = [
        {
            icon: Users,
            title: 'Team Formation Rules',
            color: 'from-blue-500 to-cyan-500',
            rules: [
                '👥 Teams of 3 members will be randomly assigned',
                '🎯 No pre-formed teams allowed - embrace new connections!',
                '🔄 Team changes are not permitted once assigned',
                '🤝 Respect and collaborate with your random teammates'
            ]
        },
        {
            icon: Code,
            title: 'Submission Guidelines',
            color: 'from-purple-500 to-pink-500',
            rules: [
                '⏰ Submit your project before the 24-hour deadline',
                '💻 Original code only - no plagiarism allowed',
                '📝 Include proper documentation and README',
                '🎥 Demo video (max 3 minutes) is mandatory'
            ]
        },
        {
            icon: Shield,
            title: 'Code of Conduct',
            color: 'from-green-500 to-teal-500',
            rules: [
                '✨ Respect all participants regardless of experience',
                '🚫 No harassment or discriminatory behavior',
                '🔒 Maintain confidentiality of team discussions',
                '🎯 Focus on learning and collaboration, not just winning'
            ]
        },
        {
            icon: Trophy,
            title: 'Judging Criteria',
            color: 'from-yellow-500 to-orange-500',
            rules: [
                '💡 Innovation & Creativity (30%)',
                '⚙️ Technical Implementation (30%)',
                '🎨 Design & User Experience (20%)',
                '📊 Impact & Practicality (20%)'
            ]
        },
        {
            icon: Clock,
            title: 'Event Timeline',
            color: 'from-red-500 to-pink-500',
            rules: [
                '🕒 Strict 24-hour coding period',
                '⏱️ Mid-hack pressure test at 12-hour mark',
                '🎪 KarmSankat dilemma round at 18-hour mark',
                '📤 Final submission window: Last 2 hours'
            ]
        },
        {
            icon: AlertTriangle,
            title: 'Important Notes',
            color: 'from-gray-500 to-gray-700',
            rules: [
                '⚠️ Internet usage is allowed for research',
                '📚 Using libraries and frameworks is encouraged',
                '🔍 Code will be checked for originality',
                '🏆 Bonus points for overcoming KarmSankat challenge'
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="backdrop-blur-xl rounded-3xl border border-cyan-400/30 max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto custom-scrollbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 p-6 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl bg-transparent border-none md:text-3xl font-orbitron text-cyan-400">
                                                CodeYudh Guidelines
                                            </h2>
                                            <p className="text-gray-300 text-sm mt-1">
                                                Everything you need to know for an amazing hackathon experience
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-cyan-400/10 rounded-xl transition-all duration-300 border border-cyan-400/30 hover:border-cyan-400/60 hover:scale-110"
                                    >
                                        <X className="w-6 h-6 text-cyan-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {guidelines.map((section, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all duration-300 group"
                                        >
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <section.icon className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="text-lg font-orbitron text-white group-hover:text-cyan-300 transition-colors">
                                                    {section.title}
                                                </h3>
                                            </div>

                                            <ul className="space-y-3">
                                                {section.rules.map((rule, ruleIndex) => (
                                                    <motion.li
                                                        key={ruleIndex}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 + ruleIndex * 0.05 }}
                                                        className="flex items-start space-x-3 text-sm text-gray-300 group-hover:text-gray-200 transition-colors"
                                                    >
                                                        <span className="text-cyan-400 mt-0.5 flex-shrink-0">▸</span>
                                                        <span>{rule}</span>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Special Note */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-8 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl p-6 text-center"
                                >
                                    <div className="flex items-center justify-center space-x-2 mb-3">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <h4 className="text-lg font-orbitron text-cyan-300">Pro Tip</h4>
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <p className="text-gray-300">
                                        Embrace the random team assignment! Some of the best innovations come from diverse perspectives.
                                        The <span className="text-cyan-400 font-semibold">KarmSankat challenge</span> is your chance to showcase leadership and strategic thinking.
                                    </p>
                                </motion.div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-black/40 backdrop-blur-md border-t border-cyan-400/30 px-2">
                                <div className="flex flex-col sm:flex-row gap-1 items-center justify-between">
                                    <p className="text-gray-400 text-sm text-center sm:text-left">
                                        💡 Read carefully - these guidelines ensure fair play for everyone
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="m-2 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-orbitron hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 hover:scale-90 min-w-[80px]"
                                    >
                                        Got It!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};