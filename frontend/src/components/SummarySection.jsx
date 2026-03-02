import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export const SummarySection = ({ summary }) => {
    const summaryParagraphs = summary
        .split('\n')
        .filter(line => line.trim() !== '')
        .map((line, i) => (
            <p key={i} className="mb-4 text-slate-300 leading-relaxed font-light text-lg">
                {line.split('**').map((part, index) =>
                    index % 2 === 1 ? <strong key={index} className="text-white font-semibold">{part}</strong> : part
                )}
            </p>
        ));

    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="summary-container glass p-8 rounded-3xl"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <FileText className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-100 to-sky-100 bg-clip-text text-transparent">
                    Summary
                </h2>
            </div>

            <div className="summary-content max-h-[600px] overflow-y-auto pr-4 scrollbar-thin">
                {summaryParagraphs.length > 0 ? summaryParagraphs : (
                    <p className="text-slate-400 italic">No summary produced.</p>
                )}
            </div>
        </motion.aside>
    );
};
