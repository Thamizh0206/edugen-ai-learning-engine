import { motion } from 'framer-motion';

export const LoadingSection = ({ text }) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mx-auto p-12 glass rounded-3xl text-center flex flex-col items-center gap-6"
        >
            <div className="relative w-24 h-24">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-full h-full rounded-full border-4 border-white/5 border-t-primary shadow-[0_0_20px_rgba(192,132,252,0.3)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-white/5 border-b-sky-400 rotate-45 animate-spin" />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                    {text || "Analyzing your notes..."}
                </h3>
                <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    Our AI is crafting a beautiful summary and building your custom quiz. This usually takes 10-20 seconds.
                </p>

                <div className="flex justify-center gap-2 mt-4">
                    {[0.1, 0.2, 0.3].map((delay, i) => (
                        <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 1, delay }}
                            className="w-2 h-2 rounded-full bg-primary/40"
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};
