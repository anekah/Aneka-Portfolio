import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { cn } from '../lib/utils.ts';

const words = [
  { text: "Hi I'm ", type: "normal" },
  { text: "Anesuishe", type: "highlight", color: "text-black font-black" },
  { text: " ", type: "normal" },
  { text: "With over four years of experience as a ", type: "normal" },
  { text: "digital marketing specialist", type: "highlight", color: "text-accent font-bold italic" },
  { text: " I focus on crafting high-impact campaigns that deliver ", type: "normal" },
  { text: "measurable growth", type: "highlight", color: "text-black underline decoration-accent/40 decoration-4 underline-offset-4" },
  { text: " My expertise covers the full digital spectrum—from ", type: "normal" },
  { text: "SEO and paid media", type: "highlight", color: "text-accent font-bold" },
  { text: " to ", type: "normal" },
  { text: "sophisticated social strategy", type: "highlight", color: "text-accent font-bold" },
  { text: " and ", type: "normal" },
  { text: "data analytics", type: "highlight", color: "text-accent font-bold" },
  { text: " I excel at bridging the gap between ", type: "normal" },
  { text: "complex datasets", type: "highlight", color: "text-black font-black" },
  { text: " and ", type: "normal" },
  { text: "actionable insights", type: "highlight", color: "text-black font-black" },
  { text: " driven by the belief that impactful marketing always begins with a ", type: "normal" },
  { text: "deep understanding of human behavior", type: "highlight", color: "text-black font-black border-b-2 border-accent" },
  { text: " ", type: "normal" }
];

export function ImmersiveAboutContent() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });
  const [complete, setComplete] = useState(false);

  return (
    <motion.div 
      ref={containerRef} 
      animate={isInView ? { y: [0, -5, 0] } : {}}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="space-y-8 text-black/80 text-lg md:text-xl font-medium leading-relaxed max-w-3xl"
    >
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.015,
              onComplete: () => setComplete(true)
            }
          }
        }}
        className="flex flex-wrap"
      >
        {words.map((word, wIdx) => (
          <motion.span
            key={wIdx}
            className="flex flex-wrap mr-[0.25em]"
          >
            {word.text.split('').map((char, cIdx) => (
              <motion.span
                key={cIdx}
                variants={{
                  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    filter: "blur(0px)",
                    transition: { duration: 0.4 }
                  }
                }}
                whileHover={{ scale: word.type === 'highlight' ? 1.05 : 1, transition: { duration: 0.2 } }}
                className={cn(
                  "transition-all duration-300",
                  word.type === 'highlight' ? word.color : ''
                )}
                style={word.type === 'highlight' ? {
                  textShadow: complete ? "0 0 10px rgba(183, 148, 110, 0.2)" : "none"
                } : {}}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.span>
        ))}

        <motion.span
          animate={{ 
            opacity: [1, 0, 1],
          }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[3px] h-[1.1em] bg-accent ml-1 translate-y-[0.1em] shadow-[0_0_8px_rgba(183,148,110,0.5)]"
        />
      </motion.div>

      {complete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="pt-4"
        >
          <motion.div 
            animate={{ 
              boxShadow: [
                "0 0 0px rgba(183, 148, 110, 0)", 
                "0 0 20px rgba(183, 148, 110, 0.1)", 
                "0 0 0px rgba(183, 148, 110, 0)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 text-xs font-modern font-black uppercase tracking-[0.4em] text-accent/60"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Scanning Narrative complete
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
