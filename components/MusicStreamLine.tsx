import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

const PREF_KEY = "stryde:sound";

const MusicStreamLine = ({ color }: { color: string }) => {
  const [isPlay, setIsPlay] = useState(false);
  const [awaitingFirstClick, setAwaitingFirstClick] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useGSAP(() => {
    if (!divRef.current) return;
    const bars = Array.from(divRef.current.children);
    gsap.killTweensOf(bars);
    bars.forEach((bar, index) => {
      if (isPlay && !prefersReducedMotion())
        gsap.to(bar, {
          scaleY: 3 + Math.random() * 2,
          duration: 0.3 + Math.random() * 0.2,
          delay: index * 0.1 + Math.random() * 0.1,
          yoyo: true,
          repeat: -1,
        });
      else gsap.to(bar, { scaleY: 1, duration: 0.2, ease: "power1.out" });
    });
  }, [isPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.2;
    if (isPlay) {
      audio.play().catch(() => setIsPlay(false));
    } else audio.pause();
  }, [isPlay]);

  // Sound starts with the first click in the 3D experience unless the visitor
  // turned it off before or prefers reduced motion.
  useEffect(() => {
    if (window.sessionStorage.getItem(PREF_KEY) === "off" || prefersReducedMotion()) return;
    setAwaitingFirstClick(true);
    const handleFirstClick = () => {
      setIsPlay(true);
      setAwaitingFirstClick(false);
      window.sessionStorage.setItem(PREF_KEY, "on");
    };
    window.addEventListener("click", handleFirstClick, { once: true });
    return () => window.removeEventListener("click", handleFirstClick);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAwaitingFirstClick(false);
    setIsPlay((playing) => {
      window.sessionStorage.setItem(PREF_KEY, playing ? "off" : "on");
      return !playing;
    });
  };

  return (
    <>
      {awaitingFirstClick && (
        <p
          className={clsx(
            "fixed inset-x-0 bottom-3 text-center pointer-events-none md:text-xs text-[10px] font-medium tracking-wider animate-pulse",
            color === "bg-black" ? "text-black" : "text-white"
          )}
        >
          CLICK ANYWHERE TO ENABLE SOUND
        </p>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isPlay}
        aria-label={isPlay ? "Turn sound off" : "Turn sound on"}
        className="flex justify-center items-center size-7 hover-animation"
      >
        <span ref={divRef} className="flex gap-1">
          <span className={clsx("block w-0.5 h-1", color)} />
          <span className={clsx("block w-0.5 h-1", color)} />
          <span className={clsx("block w-0.5 h-1", color)} />
        </span>
        <audio ref={audioRef} src="/main-optimized.mp3" preload="none" loop />
      </button>
    </>
  );
};

export default MusicStreamLine;
