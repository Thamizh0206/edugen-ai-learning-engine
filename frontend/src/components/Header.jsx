import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
    return (
        <header className="text-center mb-12 mt-12 animate-fade-in-down">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    EduGen AI
                </h1>
            </div>
            <p className="text-sky-800 text-lg font-medium tracking-wide">
                Turn your notes into knowledge instantly.
            </p>
        </header>
    );
};
