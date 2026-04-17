import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { 
  ArrowUpRight, 
  Twitter, 
  Send, 
  Menu, 
  X,
  ChevronRight,
  Sparkles,
  Command,
  Target,
  BarChart3,
  MousePointer2
} from 'lucide-react';
import { cn } from './lib/utils.ts';
import { useLocation, useNavigate } from 'react-router-dom';

// --- 3D Components ---

function Scene() {
  const sphereRef = useRef<any>(null);
  const { scrollYProgress } = useScroll();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Create parallax values for position and rotation
  const yPos = useTransform(scrollYProgress, [0, 1], [0.5, -5]);
  const rotationOffset = useTransform(scrollYProgress, [0, 1], [0, Math.PI]);
  
  const springY = useSpring(yPos, { stiffness: 100, damping: 30 });
  const springRotation = useSpring(rotationOffset, { stiffness: 100, damping: 30 });
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2 + springRotation.get();
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      sphereRef.current.position.y = springY.get();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere 
          ref={sphereRef} 
          args={[isMobile ? 0.8 : 1.2, 64, 64]} 
          position={[isMobile ? 0 : 1.5, isMobile ? 0 : 0.5, 0]}
        >
          <MeshDistortMaterial
            color="#222"
            speed={2}
            distort={0.4}
            radius={1}
            emissive="#111"
            metalness={0.9}
            roughness={0.1}
          />
        </Sphere>
      </Float>

      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={20}
        blur={2}
        far={4.5}
      />
      <Environment preset="city" />
    </>
  );
}

// --- Constants & Variants ---

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] as const
      }
    }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  }
};

// --- UI Components ---

const AnimatedCounter = ({ value, duration = 2, suffix = "" }: { value: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = value;
          const totalFrames = duration * 60;
          let frame = 0;

          const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentCount = end * progress;

            if (frame === totalFrames) {
              setCount(end);
              clearInterval(counter);
            } else {
              setCount(currentCount);
            }
          }, 1000 / 60);

          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (nodeRef.current) {
      observer.observe(nodeRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={nodeRef} className="tabular-nums">
      {count % 1 === 0 ? count.toLocaleString() : count.toFixed(1)}
      {suffix}
    </span>
  );
};

const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center gap-3 mb-6", className)}>
    <div className="h-[1px] w-8 bg-accent/40" />
    <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
      {children}
    </span>
  </div>
);

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("access_key", "2db9883a-8528-44fa-b715-b21bdd2cdb20");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.message || "Failed to send message.");
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent/40 ml-4">Full Name</label>
        <motion.input 
          whileFocus={{ scale: 1.01, borderColor: "rgba(109, 0, 26, 0.3)" }}
          name="name"
          type="text" 
          required
          placeholder="E.g. Alexander Knight"
          className="w-full h-16 px-8 rounded-full bg-accent/5 border border-accent/10 text-black placeholder:text-black/20 focus:outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent/40 ml-4">Email Address</label>
        <motion.input 
          whileFocus={{ scale: 1.01, borderColor: "rgba(109, 0, 26, 0.3)" }}
          name="email"
          type="email" 
          required
          placeholder="alex@studio.com"
          className="w-full h-16 px-8 rounded-full bg-accent/5 border border-accent/10 text-black placeholder:text-black/20 focus:outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent/40 ml-4">Brief Narrative</label>
        <motion.textarea 
          whileFocus={{ scale: 1.01, borderColor: "rgba(109, 0, 26, 0.3)" }}
          name="message"
          required
          placeholder="Tell me about your vision..."
          className="w-full h-40 px-8 py-6 rounded-3xl bg-accent/5 border border-accent/10 text-black placeholder:text-black/20 focus:outline-none transition-all resize-none"
        />
      </div>
      
      <div className="relative">
        <motion.button 
          disabled={status === 'sending'}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 25px rgba(109, 0, 26, 0.25)"
          }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className={cn(
            "w-full h-16 rounded-full font-modern font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300",
            status === 'sending' ? "bg-neutral-200 text-neutral-400 cursor-not-allowed" : "bg-accent text-white shadow-lg shadow-accent/20"
          )}
        >
          {status === 'sending' ? "Transmitting..." : "Send Inquiry"} <Send size={16} />
        </motion.button>

        <AnimatePresence>
          {status === 'success' && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-0 right-0 text-center text-[10px] uppercase tracking-widest font-bold text-green-600"
            >
              Success! Your narrative has been received.
            </motion.p>
          )}
          {status === 'error' && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-0 right-0 text-center text-[10px] uppercase tracking-widest font-bold text-accent"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

export default function App() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const { scrollY, scrollYProgress } = useScroll();

  // Handle initial deep link scroll
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Wait a bit for components to mount (esp. 3D canvas)
        const timeout = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [hash]);

  // Deep Link: Update hash as user scrolls
  useEffect(() => {
    const sections = ['experience', 'about', 'skills', 'work', 'connect'];
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observers = sections.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Update URL without triggering scroll via React Router
            window.history.replaceState(null, '', `#${id}`);
          }
        });
      }, options);

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus(id);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const logoOpacity = useTransform(scrollY, [0, 50], [1, 0]);

  const mouseX = useSpring(0, { stiffness: 50 });
  const mouseY = useSpring(0, { stiffness: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-[100] origin-left" 
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center bg-transparent">
        <motion.div 
          style={{ opacity: logoOpacity }}
          className="text-xl font-modern font-black tracking-tighter text-accent cursor-pointer"
        >
          Anesuishe.
        </motion.div>
        
        <motion.div 
          variants={ANIMATION_VARIANTS.container}
          initial="hidden"
          animate="visible"
          className="hidden md:flex gap-12 items-center"
        >
          {['About', 'Skills', 'Work', 'Connect'].map((item, idx) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase()}`}
              variants={ANIMATION_VARIANTS.item}
              whileHover={{ y: -2 }}
              className="text-[10px] uppercase tracking-[0.3em] font-black text-accent/60 hover:text-accent transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </motion.div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-accent p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[49] bg-[#F8F7F3] flex flex-col items-center justify-center gap-12 md:hidden p-6"
          >
            {['About', 'Skills', 'Work', 'Connect'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="mockup-heading text-6xl text-accent hover:tracking-widest transition-all duration-500"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="experience" className="relative h-screen flex items-center justify-center overflow-hidden bg-[#F8F7F3]">
        <div className="absolute inset-0 z-0 opacity-40">
          <Canvas>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mockup-heading text-[18vw] leading-[0.7] text-accent text-center pointer-events-none opacity-20 md:opacity-100"
          >
            Portfolio
          </motion.h1>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
            <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:px-12 lg:px-24 pt-20 md:pt-0">
              <motion.div 
                initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-modern font-black text-black uppercase tracking-tighter text-center md:text-left leading-[0.9]"
              >
                Anesu<br/>ishe
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-modern font-black text-black uppercase tracking-tighter text-center md:text-right leading-[0.9]"
              >
                Muya<br/>mbo
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-24 left-6 md:left-12 text-black/40 text-[9px] sm:text-[10px] uppercase tracking-[0.4em] font-bold">
            inst: anehmuya
          </div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <div className="w-[1px] h-12 bg-accent/20 relative overflow-hidden">
              <motion.div 
                animate={{ y: [0, 48] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-1/2 bg-accent" 
              />
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-40 bg-[#F8F7F3]">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              <h2 className="mockup-heading text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] text-accent mb-12 md:mb-20 text-center md:text-left">
                About<br/>Me
              </h2>
              <button 
                onClick={() => copyToClipboard('about')}
                className="absolute top-0 -right-4 md:-right-12 opacity-0 group-hover:opacity-100 transition-opacity p-4 text-accent/40 hover:text-accent"
                title="Copy Deep Link"
              >
                <ArrowUpRight size={32} />
              </button>
            </div>
            <div className="space-y-8 text-black/80 text-lg md:text-xl font-medium leading-relaxed">
              <p className="text-2xl md:text-3xl font-display font-black text-black">Hi, I'm Anesuishe</p>
              <p>
                I'm a digital marketing specialist with 4+ years of experience crafting campaigns that drive real results. From SEO and paid media to social strategy and analytics, I bring a full-funnel perspective to every project. 
              </p>
              <p>
                I love turning complex data into clear, actionable insights — and I believe great marketing starts with understanding people.
              </p>
            </div>

            <motion.div 
              variants={ANIMATION_VARIANTS.container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mt-24 pt-16 border-t border-accent/10 grid grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16"
            >
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <h4 className="text-accent text-5xl sm:text-6xl font-display font-black leading-none mb-3">
                  <AnimatedCounter value={50} suffix="+" />
                </h4>
                <p className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">Brands Scaled</p>
              </motion.div>
              <motion.div variants={ANIMATION_VARIANTS.item}>
                <h4 className="text-accent text-5xl sm:text-6xl font-display font-black leading-none mb-3">
                  <AnimatedCounter value={3.2} suffix="x" />
                </h4>
                <p className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">Average ROAS</p>
              </motion.div>
              <motion.div
                variants={ANIMATION_VARIANTS.item}
                className="col-span-2 lg:col-span-1"
              >
                <h4 className="text-accent text-5xl sm:text-6xl font-display font-black leading-none mb-3">
                  R<AnimatedCounter value={80} suffix="k+" />
                </h4>
                <p className="text-[11px] uppercase tracking-[0.4em] font-black text-black/40">Revenue Generated</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 md:py-32 bg-[#F8F7F3] border-t border-accent/10">
        <div className="container mx-auto px-6">
          <div className="relative group max-w-fit mx-auto">
            <h2 className="mockup-heading text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] text-accent text-center mb-16 md:mb-24">
              Skills
            </h2>
            <button 
              onClick={() => copyToClipboard('skills')}
              className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-4 text-accent/40 hover:text-accent"
              title="Copy Deep Link"
            >
              <ArrowUpRight size={32} />
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-6xl mx-auto"
          >
            <p className="mockup-heading text-2xl text-accent mb-12">Proficiency</p>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {[
                { name: "SEO / SEM", val: 95 },
                { name: "Google & Meta Ads", val: 98 },
                { name: "Email Marketing", val: 92 },
                { name: "Content Strategy", val: 90 },
                { name: "Google Analytics", val: 94 },
                { name: "Marketing Auto.", val: 88 },
                { name: "Brand Strategy", val: 91 },
                { name: "Social Management", val: 96 }
              ].map((skill, idx) => (
                <motion.div 
                  key={skill.name} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className="group"
                >
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-modern font-black uppercase tracking-widest text-xs text-black/60 group-hover:text-accent transition-colors">{skill.name}</span>
                    <span className="font-display font-black text-accent text-xl">{skill.val}%</span>
                  </div>
                  <div className="h-1 w-full bg-accent/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-accent"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-20 pt-20 border-t border-accent/10">
              <p className="mockup-heading text-2xl text-accent mb-10">Also Mastering</p>
              <div className="flex flex-wrap gap-3">
                {["Copywriting", "A/B Testing", "Conversion Optimization", "Influence Marketing", "Market Research", "CRM Management"].map(skill => (
                  <span key={skill} className="px-5 py-2 border border-accent/10 rounded-full font-modern font-bold uppercase tracking-widest text-[9px] text-accent/60">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-20 md:py-32 bg-[#F8F7F3] border-t border-accent/10">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16 md:mb-24 relative group max-w-fit mx-auto"
          >
            <h2 className="mockup-heading text-6xl sm:text-8xl md:text-[10rem] lg:text-[12rem] text-accent">Work</h2>
            <button 
              onClick={() => copyToClipboard('work')}
              className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition-opacity p-4 text-accent/40 hover:text-accent"
              title="Copy Deep Link"
            >
              <ArrowUpRight size={32} />
            </button>
            <p className="text-accent/60 font-modern font-black uppercase tracking-[0.4em] text-xs mt-4">Selected Projects</p>
          </motion.div>

          <motion.div 
            variants={ANIMATION_VARIANTS.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {[
              {
                title: "Woolworths SA — Social Campaign",
                desc: "Seasonal social media campaign for Woolworths SA's Cape Town stores, driving a 38% increase in foot traffic through Meta Ads and influencer partnerships.",
                tags: "Meta Ads · Social Media",
                seed: "fashion"
              },
              {
                title: "Yoco — SEO & Content Strategy",
                desc: "Revamped Yoco's blog and SEO architecture, growing organic search visibility by 210% and reducing paid acquisition costs over 5 months.",
                tags: "SEO · Content Strategy",
                seed: "tech"
              },
              {
                title: "Kauai — Email Marketing Overhaul",
                desc: "Redesigned Kauai's email funnel with segmented automations and A/B tested copy, lifting open rates from 18% to 41%.",
                tags: "Email · Automation",
                seed: "coffee"
              },
              {
                title: "Naspers — Paid Media Strategy",
                desc: "Multi-platform Google and Meta paid media strategy for a Naspers digital product launch, achieving a 3.2x ROAS within the first quarter.",
                tags: "Google Ads · Paid Media",
                seed: "corporate"
              },
              {
                title: "Sealand Gear — Brand Awareness",
                desc: "Digital brand awareness campaign for Cape Town's sustainable gear brand Sealand, growing Instagram following by 9k and boosting sales by 55%.",
                tags: "Branding · Social Media",
                seed: "gear"
              },
              {
                title: "Luno — Crypto Onboarding Funnel",
                desc: "Full-funnel digital strategy for Luno's Cape Town user acquisition drive, reducing cost-per-signup by 34% through landing page testing and targeted ads.",
                tags: "Funnel · A/B Testing",
                seed: "crypto"
              },
              {
                title: "Codfather — Digital Presence Revamp",
                desc: "Rebuilt the online presence for Camps Bay's iconic seafood restaurant Codfather, launching a new Google Ads strategy and local SEO campaign that drove a 47% uplift in reservation bookings.",
                tags: "SEO · Google Ads",
                seed: "seafood"
              },
              {
                title: "Bo-Vine Wine & Grill — Social Growth",
                desc: "Managed Instagram and Facebook content strategy for Bo-Vine on the Camps Bay Promenade, growing their social following by 6.2k and increasing weekend covers through targeted paid promotions.",
                tags: "Social Media · Meta Ads",
                seed: "wine"
              },
              {
                title: "Café Caprice — Influencer Campaign",
                desc: "Coordinated a micro-influencer and email marketing campaign for Camps Bay's beloved Café Caprice, boosting Sunday brunch bookings by 62% during the summer season.",
                tags: "Influencer · Email Marketing",
                seed: "beach"
              }
            ].map((project, idx) => (
              <motion.div 
                key={idx}
                variants={ANIMATION_VARIANTS.item}
                whileHover={{ y: -10, transition: { duration: 0.4 } }}
                className="bg-white border border-accent/10 rounded-[2rem] overflow-hidden group shadow-lg shadow-accent/5 hover:shadow-xl hover:shadow-accent/10 transition-all duration-500 flex flex-col h-full"
              >
                <div className="p-10 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-display font-black text-black leading-tight group-hover:text-accent transition-colors">
                      {project.title.split(' — ')[0]}
                    </h3>
                  </div>
                  <p className="text-[11px] font-modern font-black uppercase tracking-[0.3em] text-accent/40 mb-6">{project.tags}</p>
                  <p className="text-black/60 text-base font-medium leading-relaxed mb-8 flex-grow">
                    {project.desc}
                  </p>
                  <div className="pt-6 border-t border-accent/10 flex justify-between items-center">
                    <span className="text-[9px] font-modern font-black uppercase tracking-[0.2em] text-black/20">Case Study</span>
                    <span className="text-[9px] font-modern font-black uppercase tracking-[0.2em] text-accent/40">{project.title.split(' — ')[1]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="connect" className="py-20 md:py-32 bg-[#F8F7F3] border-t border-accent/10">
        <div className="container mx-auto px-6">
          <div className="bg-white border border-accent/10 p-8 sm:p-12 md:p-24 rounded-[2rem] sm:rounded-[3rem] relative z-10 flex flex-col md:flex-row gap-12 md:gap-16 items-center shadow-xl shadow-accent/5">
            <div className="flex-1 w-full relative z-10 text-center md:text-left group">
              <div className="flex items-start justify-between">
                <h2 className="mockup-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-accent mb-8 leading-[0.9] md:leading-tight">
                  Ready to<br />Transcend?
                </h2>
                <button 
                  onClick={() => copyToClipboard('connect')}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-4 text-accent/40 hover:text-accent"
                  title="Copy Deep Link"
                >
                  <ArrowUpRight size={24} />
                </button>
              </div>
              <p className="text-black/60 text-base md:text-lg mb-12 max-w-sm font-medium mx-auto md:mx-0">
                Let's discuss how we can elevate your brand's digital narrative into something truly unforgettable.
              </p>
            </div>

            <div className="flex-1 w-full relative z-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-[#F8F7F3] border-t border-accent/10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-black/40">
          <div className="text-xs font-modern font-bold tracking-widest uppercase">
            © 2026 Anesuishe Muyambo
          </div>
          <div className="flex gap-12">
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:text-accent transition-colors">Terms</a>
            <a href="#" className="text-[10px] uppercase tracking-widest font-bold hover:text-accent transition-colors">Digital DNA</a>
          </div>
        </div>
      </footer>

      {/* Custom Cursor Effect */}
      <motion.div 
        className="fixed w-4 h-4 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{ 
          left: mouseX, 
          top: mouseY,
          translateX: "-50%",
          translateY: "-50%"
        }}
      />

      {/* Deep Link Toast Notification */}
      <AnimatePresence>
        {copyStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-12 left-1/2 z-[100] px-6 py-3 bg-black text-white rounded-full font-modern font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl"
          >
            <Sparkles size={14} className="text-accent" />
            Deep link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
