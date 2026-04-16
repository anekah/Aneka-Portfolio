import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { 
  ArrowUpRight, 
  Linkedin, 
  Twitter, 
  Instagram, 
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

// --- 3D Components ---

function Scene() {
  const sphereRef = useRef<any>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={sphereRef} args={[1.2, 64, 64]} position={[1.5, 0.5, 0]}>
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

// --- UI Components ---

const SectionLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center gap-3 mb-6", className)}>
    <div className="h-[1px] w-8 bg-accent/40" />
    <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">
      {children}
    </span>
  </div>
);

const ProjectCard = ({ 
  title, 
  category, 
  description,
  tags 
}: { 
  title: string; 
  category: string; 
  description: string;
  tags: string;
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[2rem] glass-panel p-8 md:p-10 h-[400px] md:h-[450px] flex flex-col justify-between transition-all duration-500 hover:border-white/20 active:scale-[0.98]"
    >
      {/* Liquid Glass Effect overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-500 group-hover:text-white/60 transition-colors">
            {category}
          </span>
          <motion.div 
            whileHover={{ rotate: 45, scale: 1.2 }}
            className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:border-accent/40 group-hover:bg-accent text-white transition-all duration-500"
          >
            <ArrowUpRight size={20} />
          </motion.div>
        </div>
        
        <h3 className="text-3xl md:text-4xl font-display italic text-white mb-6 group-hover:translate-x-2 transition-transform duration-500 ease-out">
          {title}
        </h3>
        <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed max-w-sm group-hover:text-neutral-300 transition-colors duration-500">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="h-[1px] w-full bg-white/5 group-hover:bg-white/10 mb-6 transition-colors" />
        <span className="text-[11px] font-modern font-bold uppercase tracking-widest text-neutral-600 group-hover:text-neutral-400 transition-colors">
          {tags}
        </span>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center bg-transparent mix-blend-difference">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-modern font-bold tracking-tight text-white cursor-pointer"
        >
          ANESUISHE.
        </motion.div>
        
        <div className="hidden md:flex gap-12 items-center">
          {['Experience', 'Work', 'Skills', 'Connect'].map((item, idx) => (
            <motion.a 
              key={item}
              href={`#${item.toLowerCase()}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="text-[11px] uppercase tracking-[0.2em] font-medium text-white/70 hover:text-white transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white p-2"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[49] bg-neutral-950 flex flex-col items-center justify-center gap-8 md:hidden p-6 pt-32"
          >
            {['Experience', 'Work', 'Skills', 'Connect'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-5xl font-modern font-bold text-white hover:text-neutral-400 transition-all duration-300 hover:tracking-widest"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="experience" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionLabel>Digital Specialist</SectionLabel>
            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-display italic leading-[0.85] text-white text-glow mb-8 -ml-1 md:-ml-4">
              Strategic <br /> <span className="not-italic font-bold font-modern">Vision.</span>
            </h1>
            <p className="max-w-md text-neutral-400 text-lg md:text-xl leading-relaxed font-light mb-12">
              Transforming brands through immersive storytelling and data-driven intelligence. Creating digital landscapes that leave a lasting imprint.
            </p>
            <div className="flex gap-6 items-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-accent text-white font-modern font-bold uppercase tracking-wider text-xs rounded-full flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(109,0,26,0.3)]"
              >
                Launch Experience <ChevronRight size={16} />
              </motion.button>
              <div className="h-10 w-[1px] bg-neutral-800" />
              <div className="flex gap-4">
                <Linkedin className="w-5 h-5 text-neutral-500 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="w-5 h-5 text-neutral-500 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-neutral-500">Scroll</span>
           <div className="w-[1px] h-12 bg-neutral-800 relative overflow-hidden">
              <motion.div 
                animate={{ y: [0, 48] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-full h-1/2 bg-accent shadow-[0_0_10px_rgba(109,0,26,1)]" 
              />
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-neutral-950">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-square relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-neutral-900/50 rounded-full blur-[100px]" />
              <div className="relative w-full h-full overflow-hidden rounded-3xl grayscale hover:grayscale-0 transition-all duration-700">
                <img 
                  src="https://picsum.photos/seed/anesuishe/800/800" 
                  alt="Personality" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionLabel>About the Craft</SectionLabel>
                <h2 className="text-4xl md:text-5xl font-display italic text-white mb-8">
                  Human insights, <br /> driven by <span className="not-italic">precision.</span>
                </h2>
                <div className="space-y-6 text-neutral-400 text-lg font-light leading-relaxed">
                  <p>
                    As a digital marketing architect, I believe every click tells a story. My approach bridges the gap between raw data and emotional connection, ensuring your brand doesn't just reach people—it resonates.
                  </p>
                  <p>
                    With 4+ years of specialized experience in SEO, paid media, and brand strategy, I focus on the "why" behind the conversion.
                  </p>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h4 className="text-accent text-2xl font-bold mb-2">4+ Years</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-widest">Experience</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <h4 className="text-accent text-2xl font-bold mb-2">50+ Projects</h4>
                    <p className="text-sm text-neutral-500 uppercase tracking-widest">Delivered</p>
                  </motion.div>
                </div>
              </motion.div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <SectionLabel>Case Studies</SectionLabel>
              <h2 className="text-4xl md:text-6xl font-display italic text-white">Immersive <span className="not-italic">Results.</span></h2>
            </div>
            <p className="max-w-xs text-neutral-500 text-sm italic py-2 md:py-0">
              A curated selection of transformations that redefined digital presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                title: "Woolworths SA",
                category: "Social Campaign",
                description: "Seasonal social media campaign for Woolworths SA's Cape Town stores, driving a 38% increase in foot traffic through Meta Ads and influencer partnerships.",
                tags: "Meta Ads · Social Media"
              },
              {
                title: "Yoco",
                category: "SEO & Content",
                description: "Revamped Yoco's blog and SEO architecture, growing organic search visibility by 210% and reducing paid acquisition costs over 5 months.",
                tags: "SEO · Content Strategy"
              },
              {
                title: "Kauai",
                category: "Email Marketing",
                description: "Redesigned Kauai's email funnel with segmented automations and A/B tested copy, lifting open rates from 18% to 41%.",
                tags: "Email · Automation"
              },
              {
                title: "Naspers",
                category: "Paid Media",
                description: "Multi-platform Google and Meta paid media strategy for a Naspers digital product launch, achieving a 3.2x ROAS within the first quarter.",
                tags: "Google Ads · Paid Media"
              },
              {
                title: "Sealand Gear",
                category: "Brand Awareness",
                description: "Digital brand awareness campaign for Cape Town's sustainable gear brand Sealand, growing Instagram following by 9k and boosting sales by 55%.",
                tags: "Branding · Social Media"
              },
              {
                title: "Luno",
                category: "Growth Funnel",
                description: "Full-funnel digital strategy for Luno's Cape Town user acquisition drive, reducing cost-per-signup by 34% through landing page testing and targeted ads.",
                tags: "Funnel · A/B Testing"
              },
              {
                title: "Codfather",
                category: "Digital Overhaul",
                description: "Rebuilt the online presence for Camps Bay's iconic heritage restaurant, launching local SEO campaigns that drove a 47% uplift in reservation bookings.",
                tags: "SEO · Google Ads"
              },
              {
                title: "Bo-Vine Wine & Grill",
                category: "Social Growth",
                description: "Managed complete content strategy for Bo-Vine on the Camps Bay Promenade, increasing weekend covers through targeted paid promotions.",
                tags: "Social Media · Meta Ads"
              },
              {
                title: "Café Caprice",
                category: "Influencer",
                description: "Coordinated micro-influencer and email marketing drive, boosting Sunday brunch bookings by 62% during the peak summer season.",
                tags: "Influencer · Email Marketing"
              }
            ].map((project, idx) => (
              <ProjectCard 
                key={project.title}
                title={project.title}
                category={project.category}
                description={project.description}
                tags={project.tags}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 bg-neutral-950">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16"
          >
            <SectionLabel>Expertise</SectionLabel>
            <h2 className="text-4xl md:text-6xl font-display italic text-white mb-4">
              What I <span className="not-italic">Bring.</span>
            </h2>
            <p className="text-neutral-500 max-w-lg">
              A comprehensive stack of digital capabilities designed to scale brands and dominate market landscapes.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              "SEO / SEM",
              "Google Ads",
              "Meta Ads",
              "Email Marketing",
              "Content Strategy",
              "Social Media",
              "Google Analytics",
              "Copywriting",
              "Marketing Auto.",
              "A/B Testing",
              "Brand Strategy",
              "Social Media Mgmt",
            ].map((skill, idx) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 glass-panel rounded-2xl flex items-center gap-4 group transition-all duration-300 hover:bg-white/5 active:scale-95"
              >
                <div className="w-2 h-2 rounded-full bg-neutral-700 group-hover:bg-accent transition-colors" />
                <span className="text-sm font-modern font-medium text-neutral-300 group-hover:text-white">
                  {skill}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="approach" className="hidden">
        {/* Methodology section removed as per user request */}
      </section>

      {/* Contact Section */}
      <section id="connect" className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="glass-panel p-12 md:p-24 rounded-[3rem] relative z-10 overflow-hidden flex flex-col md:flex-row gap-16 items-center">
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full" />
            </div>

            <div className="flex-1 relative z-10">
              <SectionLabel>Connect</SectionLabel>
              <h2 className="text-5xl md:text-7xl font-display italic text-white mb-8">Ready to <br /> <span className="not-italic">transcend?</span></h2>
              <p className="text-neutral-400 text-lg mb-12 max-w-sm">
                Let's discuss how we can elevate your brand's digital narrative into something truly unforgettable.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 text-white group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span className="text-sm uppercase tracking-widest font-medium">LinkedIn</span>
                </div>
                <div className="flex items-center gap-4 text-white group cursor-pointer">
                  <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <span className="text-sm uppercase tracking-widest font-medium">Instagram</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative z-10">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Alexander Knight"
                    className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="alex@studio.com"
                    className="w-full h-16 px-8 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-4">Brief Narrative</label>
                  <textarea 
                    placeholder="Tell me about your vision..."
                    className="w-full h-40 px-8 py-6 rounded-3xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-700 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-16 bg-accent text-white rounded-full font-modern font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(109,0,26,0.3)] hover:shadow-[0_0_40px_rgba(109,0,26,0.5)] transition-all"
                >
                  Send Inquiry <Send size={16} />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-neutral-600 font-light tracking-wide">
            © 2026 Anesuishe Muyambo. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">Digital DNA</a>
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
    </div>
  );
}
