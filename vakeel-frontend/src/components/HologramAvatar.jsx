import React, { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';

const HologramAvatar = ({ state }) => {
  const [audioData, setAudioData] = useState(new Array(31).fill(0));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Audio Processing
  useEffect(() => {
    if (state === 'listening') {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const context = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = context.createAnalyser();
          const source = context.createMediaStreamSource(stream);
          
          analyser.fftSize = 64; 
          source.connect(analyser);
          
          audioContextRef.current = context;
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateAudioData = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const normalizedData = Array.from(dataArray).map(val => val / 255);
              setAudioData(normalizedData);
            }
            animationRef.current = requestAnimationFrame(updateAudioData);
          };

          updateAudioData();
        } catch (err) {
          console.error("Microphone access denied or error:", err);
        }
      };

      initAudio();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setAudioData(new Array(31).fill(0));
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [state]);

  const waveBars = useMemo(() => [...Array(21)], []);
  const orbitalRings = useMemo(() => [...Array(3)], []);

  return (
    <div className="relative flex items-center justify-center w-80 h-80 pointer-events-none select-none">
      
      {/* 1. ATMOSPHERIC FOUNDATION: The Ambient Glow */}
      <motion.div
        animate={{
          opacity: state === 'idle' ? 0.08 : 0.15,
          scale: state === 'speaking' ? 1.2 : 1,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 bg-amber-500 rounded-full blur-[100px]"
      />

      {/* 2. STATE LAYER: Dynamic Visualizations */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          
          {/* LISTENING: Inbound Convergence Field */}
          {state === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`sonar-${i}`}
                  initial={{ scale: 2.2, opacity: 0 }}
                  animate={{ 
                    scale: [2.2, 0.8],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: "easeIn" }}
                  className="absolute w-44 h-44 border-[1px] border-amber-400/30 rounded-full"
                />
              ))}

              <div className="flex items-center justify-center gap-[3px] z-10">
                {waveBars.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: 4 + (audioData[i % audioData.length] * 60),
                      opacity: 0.3 + (audioData[i % audioData.length] * 0.7),
                      backgroundColor: i % 2 === 0 ? '#f59e0b' : '#fbbf24',
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                    className="w-[2.5px] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* SPEAKING: Authoritative Resonant Projection */}
          {state === 'speaking' && (
            <motion.div
              key="speaking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.05, 0.2, 0.05] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-72 h-72 bg-amber-500 rounded-full blur-[90px]"
              />

              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`res-${i}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.8, 2], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                  className="absolute w-44 h-44 border-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                  style={{ borderWidth: i % 2 === 0 ? '1.5px' : '0.5px' }}
                />
              ))}

              <div className="flex items-center justify-center gap-2 z-10">
                {[...Array(11)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: 12 + (audioData[i % audioData.length] * 80),
                      opacity: 0.5 + (audioData[i % audioData.length] * 0.5),
                    }}
                    transition={{ type: "spring", bounce: 0.1, duration: 0.15 }}
                    className="w-2 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)]"
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* THINKING: Judicial Data Synthesis */}
          {state === 'thinking' && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                  className="absolute rounded-full border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                  style={{ width: 170 + i * 45, height: 170 + i * 45, borderStyle: i === 1 ? 'dashed' : 'solid', borderWidth: i === 1 ? '2px' : '1px' }}
                />
              ))}
              
              {[...Array(18)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                  className="absolute w-[2px] h-[2px] bg-amber-300 rounded-sm shadow-[0_0_10px_#f59e0b]"
                  style={{ transform: `rotate(${i * 20}deg) translateY(-110px)` }}
                />
              ))}
              
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.35, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-44 h-44 bg-amber-500/20 rounded-full blur-3xl"
              />
            </motion.div>
          )}

          {/* IDLE: Stately Standby */}
          {state === 'idle' && (
             <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
             >
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-72 h-72 border border-amber-500/10 rounded-full border-dashed" />
                <motion.div animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.02, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="w-60 h-60 border-[1.5px] border-amber-500/30 rounded-full shadow-[inset_0_0_30px_rgba(245,158,11,0.1)]" />
                <motion.div animate={{ left: ['-150%', '150%'], opacity: [0, 0.15, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }} className="absolute w-32 h-[450px] bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl -rotate-[35deg] z-40 pointer-events-none" />
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. CENTRAL CORE: The Icon of Law */}
      <motion.div
        animate={{
          borderColor: state === 'idle' ? ['rgba(245,158,11,0.3)', 'rgba(245,158,11,0.6)', 'rgba(245,158,11,0.3)'] : 'rgba(245,158,11,0.8)',
          boxShadow: state === 'idle' 
            ? ['0 10px 25px -5px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 0 10px rgba(245,158,11,0.05)', '0 15px 40px -5px rgba(245,158,11,0.15), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 0 20px rgba(245,158,11,0.1)', '0 10px 25px -5px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.1), inset 0 0 10px rgba(245,158,11,0.05)'] 
            : '0 0 50px rgba(245,158,11,0.2), inset 0 0 25px rgba(245,158,11,0.15), 0 12px 30px -8px rgba(0,0,0,0.9)',
        }}
        transition={{ duration: state === 'idle' ? 6 : 0.8, repeat: state === 'idle' ? Infinity : 0, ease: "easeInOut" }}
        className="relative z-20 flex items-center justify-center w-48 h-48 bg-gradient-to-b from-stone-900 to-black backdrop-blur-3xl border-[3px] rounded-full overflow-hidden"
      >
        <div className="absolute inset-0 rounded-full border-t border-white/10 pointer-events-none" />

        {state === 'listening' && (
          <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-15">
            {audioData.slice(0, 21).map((val, i) => {
              const distanceFromCenter = Math.abs(i - 10);
              const heightMultiplier = 1 - (distanceFromCenter * 0.08);
              return (
                <motion.div key={`internal-${i}`} animate={{ height: 10 + (val * 50 * heightMultiplier) }} transition={{ type: "spring", bounce: 0, duration: 0.1 }} className="w-[5px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.2)]" />
              );
            })}
          </div>
        )}

        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.2) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        <motion.div animate={{ top: ['-10%', '110%'] }} transition={{ duration: state === 'thinking' ? 1.5 : 4, repeat: Infinity, ease: "linear" }} className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent z-30" />

        <motion.div animate={{ scale: state === 'speaking' ? [1, 1.05, 1] : 1, rotate: 0, color: state === 'idle' ? '#d97706' : '#fbbf24' }} transition={{ scale: { duration: 0.4, repeat: state === 'speaking' ? Infinity : 0 } }}>
          <Scale size={74} strokeWidth={1.2} className={`transition-all duration-700 ${state === 'idle' ? 'opacity-60' : 'drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]'}`} />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none" />
      </motion.div>

      {/* 4. BASE PEDESTAL GLOW (Floor Projection) */}
      <motion.div animate={{ opacity: state === 'idle' ? 0.1 : 0.3, width: state === 'speaking' ? ['70%', '85%', '70%'] : '70%' }} className="absolute -bottom-4 h-1 bg-amber-500/40 rounded-full blur-md" />
    </div>
  );
};

export default HologramAvatar;