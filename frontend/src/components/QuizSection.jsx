import { useState, useEffect } from 'react';
import { Target, CheckCircle, XCircle, ChevronLeft, ChevronRight, HelpCircle, Award, Trophy, RotateCcw, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import axios from 'axios';

export const QuizSection = ({ questions, topic, user_id, onHome }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [feedback, setFeedback] = useState({});
    const [loading, setLoading] = useState({});
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    const isFinished = Object.keys(userAnswers).length === totalQuestions;

    const handleSelectOption = async (optionLetter) => {
        if (userAnswers[currentIndex] || loading[currentIndex]) return;

        setUserAnswers(prev => ({ ...prev, [currentIndex]: optionLetter }));
        setLoading(prev => ({ ...prev, [currentIndex]: true }));

        try {
            const resp = await axios.post('/submit-answer', {
                user_id: user_id || "guest",
                topic: topic || "default",
                question: currentQuestion.question,
                correct_answer: currentQuestion.answer,
                user_answer: optionLetter,
                context: currentQuestion.explanation || ""
            });

            const isCorrect = resp.data.result === 'correct';
            if (isCorrect) setScore(prev => prev + 1);

            setFeedback(prev => ({
                ...prev,
                [currentIndex]: {
                    isCorrect,
                    explanation: currentQuestion.explanation,
                    followup: resp.data.followup
                }
            }));
        } catch (err) {
            console.error("Evaluation error:", err);
            // Fallback if backend fails
            const isCorrect = optionLetter === currentQuestion.answer;
            if (isCorrect) setScore(prev => prev + 1);
            setFeedback(prev => ({
                ...prev,
                [currentIndex]: {
                    isCorrect,
                    explanation: currentQuestion.explanation
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [currentIndex]: false }));
        }
    };

    const nextSlide = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleFinish = () => {
        setShowScore(true);
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setUserAnswers({});
        setFeedback({});
        setLoading({});
        setScore(0);
        setShowScore(false);
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="glass p-12 rounded-3xl text-center">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-8 h-8 text-danger" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No quiz questions generated</h3>
                <p className="text-slate-400">Try uploading a longer or more detailed file.</p>
            </div>
        );
    }

    if (showScore) {
        const percentage = Math.round((score / totalQuestions) * 100);
        let rank = "Novice Explorer";
        let message = "Keep learning, you'll get there!";
        let rankColor = "text-sky-400";

        if (percentage >= 90) {
            rank = "Master Mind";
            message = "Unbelievable! You're a true subject expert.";
            rankColor = "text-yellow-400";
        } else if (percentage >= 70) {
            rank = "Knowledge Seeker";
            message = "Great work! You have a solid grasp of the material.";
            rankColor = "text-emerald-400";
        } else if (percentage >= 50) {
            rank = "Rising Star";
            message = "Good effort! A bit more study and you'll be an expert.";
            rankColor = "text-indigo-400";
        }

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass p-12 rounded-[40px] text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 border border-white/10 flex items-center justify-center mx-auto mb-10 shadow-inner"
                    >
                        {percentage >= 70 ? (
                            <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                        ) : (
                            <Award className="w-12 h-12 text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                        )}
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm mb-2"
                    >
                        Quiz Complete
                    </motion.p>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-5xl font-black mb-6 bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent"
                    >
                        Your Score
                    </motion.h2>

                    <div className="flex items-center justify-center gap-6 mb-10">
                        <div className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10 w-40">
                            <span className="text-4xl font-bold text-white mb-1">{score}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Correct</span>
                        </div>
                        <div className="flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10 w-40">
                            <span className="text-4xl font-bold text-white mb-1">{totalQuestions}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Total</span>
                        </div>
                    </div>

                    <div className="mb-12 space-y-4">
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className={cn("text-xl font-bold", rankColor)}>{rank}</span>
                            <span className="text-2xl font-black text-white/90">{percentage}%</span>
                        </div>
                        <p className="text-slate-300 italic text-lg">{message}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={resetQuiz}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all flex items-center justify-center gap-2 group"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Retake Quiz
                        </button>
                        <button
                            onClick={onHome || (() => window.location.reload())}
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] text-white font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Layout className="w-5 h-5" />
                            Return Home
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="quiz-container glass p-10 rounded-3xl w-full"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Target className="w-5 h-5 text-sky-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-100 to-indigo-100 bg-clip-text text-transparent">
                        Knowledge Check
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-indigo-300 font-medium px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Score: {score} / {totalQuestions}
                    </span>
                </div>
            </div>

            <div className="progress-bar h-2 bg-white/5 rounded-full mb-10 overflow-hidden border border-white/10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                />
            </div>

            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-primary font-bold text-3xl leading-none">
                                {currentIndex + 1}.
                            </span>
                            <h3 className="text-xl font-medium text-slate-100 leading-snug">
                                {currentQuestion.question}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option, idx) => {
                                const match = option.trim().match(/^([A-D])[\s\)\.]/);
                                const letter = match ? match[1] : option.trim().charAt(0).toUpperCase();

                                const isSelected = userAnswers[currentIndex] === letter;
                                const isAnswerCorrect = currentQuestion.answer === letter;
                                const hasAnswered = !!userAnswers[currentIndex];

                                // Show color feedback immediately once answered
                                const showAsCorrect = hasAnswered && isAnswerCorrect;
                                const showAsWrong = isSelected && !isAnswerCorrect;

                                return (
                                    <button
                                        key={idx}
                                        disabled={!!userAnswers[currentIndex]}
                                        onClick={() => {
                                            const match = option.trim().match(/^([A-D])[\s\)\.]/);
                                            const actualLetter = match ? match[1] : option.trim().charAt(0).toUpperCase();
                                            handleSelectOption(actualLetter);
                                        }}
                                        className={cn(
                                            "group p-5 text-left rounded-2xl border transition-all duration-300 relative overflow-hidden",
                                            !hasAnswered
                                                ? "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-primary/5 translate-y-0 active:scale-95"
                                                : showAsWrong
                                                    ? "bg-danger/10 border-danger/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                                                    : showAsCorrect
                                                        ? "bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                                        : "bg-white/2 border-white/5 opacity-50 grayscale"
                                        )}
                                    >
                                        <div className="flex items-center justify-between pointer-events-none">
                                            <span className="text-lg leading-relaxed">{option}</span>
                                            {hasAnswered && (
                                                isAnswerCorrect ? (
                                                    <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                                                ) : isSelected ? (
                                                    <XCircle className="w-5 h-5 text-danger shrink-0" />
                                                ) : null
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {feedback[currentIndex] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={cn(
                                    "p-6 rounded-2xl border flex flex-col gap-3",
                                    feedback[currentIndex].isCorrect ? "bg-accent/10 border-accent/20" : "bg-danger/10 border-danger/20"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={cn("font-bold text-lg", feedback[currentIndex].isCorrect ? "text-accent" : "text-danger")}>
                                        {feedback[currentIndex].isCorrect ? "Brilliant!" : "Not quite right"}
                                    </span>
                                </div>
                                <p className="text-slate-200 leading-relaxed font-light italic">
                                    {feedback[currentIndex].explanation}
                                </p>
                                {feedback[currentIndex].followup && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-sky-300 font-medium mb-1 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <HelpCircle className="w-3.5 h-3.5" /> Dig deeper:
                                        </p>
                                        <p className="text-slate-300 font-medium">{feedback[currentIndex].followup}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className="btn secondary-btn px-6 py-2.5 flex items-center gap-2 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Previous
                </button>
                <span className="text-slate-500 select-none">
                    Question {currentIndex + 1} of {totalQuestions}
                </span>

                {currentIndex === totalQuestions - 1 ? (
                    <button
                        onClick={handleFinish}
                        disabled={!userAnswers[currentIndex]}
                        className="btn primary-btn px-10 py-2.5 flex items-center gap-2 group bg-gradient-to-r from-emerald-500 to-teal-600 border-none shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        Finish Quiz <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                ) : (
                    <button
                        onClick={nextSlide}
                        disabled={!userAnswers[currentIndex]}
                        className="btn primary-btn px-8 py-2.5 flex items-center gap-2 group"
                    >
                        Next <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};
