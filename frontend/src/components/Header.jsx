import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
    return (
        <header className="text-center mb-12 mt-12 animate-fade-in-down">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
                    Hush
                </h1>
            </div>
            <p className="text-slate-400 text-lg font-light tracking-wide">
                Turn your notes into knowledge instantly.
            </p>
        </header>
    );
};
