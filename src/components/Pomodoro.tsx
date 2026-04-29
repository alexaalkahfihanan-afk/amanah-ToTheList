import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { cn } from "../lib/utils";

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleComplete = () => {
    setIsActive(false);
    if (!isBreak) {
      // Finished focus, start break
      setIsBreak(true);
      setTimeLeft(5 * 60);
      alert("Waktu fokus selesai! Ambil istirahat sejenak ☕");
    } else {
      // Finished break, back to focus
      setIsBreak(false);
      setTimeLeft(25 * 60);
      alert("Istirahat selesai! Mari kembali fokus 💪");
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-[#151719] border border-[#2A2D31] p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TimerIcon size={14} className={cn(isBreak ? "text-emerald-500" : "text-accent")} />
          <span className="mono-label !text-[10px] uppercase font-bold">
            {isBreak ? "Break" : "Fokus"}
          </span>
        </div>
        <button 
          onClick={resetTimer}
          className="p-1 hover:bg-[#2A2D31] rounded transition-colors"
        >
          <RotateCcw size={12} className="text-[#6A6D71]" />
        </button>
      </div>

      <div className="text-3xl font-black mb-4 tracking-tighter">
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>

      <button
        onClick={toggleTimer}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2 rounded font-black text-[10px] uppercase tracking-widest transition-all",
          isActive 
            ? "bg-[#2A2D31] text-[#6A6D71] hover:text-white" 
            : "bg-white text-black hover:brightness-110"
        )}
      >
        {isActive ? (
          <>
            <Pause size={12} /> JEDA
          </>
        ) : (
          <>
            <Play size={12} fill="currentColor" /> MULAI
          </>
        )}
      </button>
    </div>
  );
}
