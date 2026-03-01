"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function MatrixTransformation() {
  const { setTheme } = useTheme();
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [hackerMessage, setHackerMessage] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleTrigger = async () => {
      console.log("Deep scan initiated...");
      setShow(true);
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.7;
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      }

      // INTELLIGENCE GATHERING
      const rawOS = navigator.platform.toLowerCase();
      let os = "Linux";
      if (rawOS.includes("win")) os = "Windows";
      else if (rawOS.includes("mac")) os = "Mac";
      else if (rawOS.includes("linux")) os = "Linux";

      let city = "Unknown City";
      let country = "Unknown Land";
      let isp = "Local Network";

      try {
        const res = await fetch('https://ipapi.co/json/');
        const json = await res.json();
        city = json.city;
        country = json.country_name;
        
        const rawIsp = json.org.toLowerCase();
        if (rawIsp.includes("jio")) isp = "Jio";
        else if (rawIsp.includes("airtel")) isp = "Airtel";
        else if (rawIsp.includes("vodafone") || rawIsp.includes("vi ")) isp = "Vi";
        else if (rawIsp.includes("google")) isp = "Google Fiber";
        else if (rawIsp.includes("bsnl")) isp = "BSNL";
        else isp = json.org.split(' ')[0];
      } catch (e) {}

      // Personalized final name
      const userName = session?.user?.name || "Neo";

      const sequence = [
        { text: `I see you, ${os} user...`, time: 1000 },
        { text: `I know you live near ${city} in ${country}...`, time: 4000 },
        { text: `We know you are using ${isp}...`, time: 7000 },
        { text: `Wake up, ${userName}...`, time: 10000 },
        { text: ``, time: 13000 }
      ];

      sequence.forEach((item) => {
        setTimeout(() => setHackerMessage(item.text), item.time);
      });

      // Sync theme change
      setTimeout(() => setTheme("matrix"), 12500);

      // Lifecycle
      setTimeout(() => {
        setShow(false);
        if (audioRef.current) {
            const fadeInterval = setInterval(() => {
                if (audioRef.current && audioRef.current.volume > 0.05) {
                    audioRef.current.volume -= 0.05;
                } else {
                    if (audioRef.current) audioRef.current.pause();
                    clearInterval(fadeInterval);
                }
            }, 50);
        }
      }, 15000);
    };

    window.addEventListener("start-matrix-transformation", handleTrigger);
    return () => window.removeEventListener("start-matrix-transformation", handleTrigger);
  }, [setTheme, session]);

  // Digital Rain Canvas
  useEffect(() => {
    if (!show || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = new Array(Math.floor(columns)).fill(1);
    let animationId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize); };
  }, [show]);

  return (
    <>
      <audio ref={audioRef} src="/audio/matrix.mp3" preload="auto" hidden />
      
      <AnimatePresence>
        {show && (
          <motion.div
            key="matrix-ritual-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden bg-black"
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

            {/* Ominous Personalized Dialogue */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 md:pb-48 z-20">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={hackerMessage}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-[#00ff41] font-mono text-2xl md:text-4xl tracking-[0.2em] text-center px-6 drop-shadow-[0_0_15px_#00ff41] uppercase"
                    >
                        {hackerMessage}
                    </motion.p>
                </AnimatePresence>
            </div>

            {/* THE MATRIX Title */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.8, 1, 1.1, 1.2, 1.5] }}
                transition={{ duration: 13, times: [0, 0.5, 0.7, 0.9, 1], delay: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
            >
                <h2 className="text-7xl md:text-[10rem] font-black text-[#00ff41] font-mono tracking-tighter drop-shadow-[0_0_40px_#00ff41] text-center select-none uppercase">
                    THE MATRIX
                </h2>
            </motion.div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
