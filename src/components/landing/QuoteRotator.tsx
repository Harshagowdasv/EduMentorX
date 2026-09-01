import React, { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';

const quotes = [
  { text: "Every great journey becomes easier with the right mentor.", author: "EduMentorX Philosophy" },
  { text: "Guidance turns potential into extraordinary progress.", author: "Academic Excellence Initiative" },
  { text: "Learn. Grow. Connect. Succeed.", author: "Future Leaders Vision" },
  { text: "The delicate art of mentoring is to unleash someone's inner potential.", author: "Institutional Leadership" },
];

export const QuoteRotator: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 300);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/50 backdrop-blur-md shadow-lg max-w-xl">
      <Quote className="w-5 h-5 text-indigo-400 shrink-0" />
      <div className="flex-1 min-w-0 transition-opacity duration-300" style={{ opacity: fade ? 1 : 0 }}>
        <p className="text-sm font-medium italic text-indigo-200 truncate">
          "{quotes[index].text}"
        </p>
      </div>
      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
    </div>
  );
};
