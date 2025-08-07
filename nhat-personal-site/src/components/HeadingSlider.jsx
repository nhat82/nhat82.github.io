import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const springConfig = {
  damping: 15,
  stiffness: 180,
  mass: 0.15,
};

const history = [
  {
    year: 2003,
    event: "Born in Vietnam 🇻🇳",
  },
  {
    year: 2010,
    event: "Trilingual (EN, DE, VN)",
  },
  {
    year: 2018,
    event: "English major in high school. Switch to tech with robotics club and research competitions",
  },
  {
    year: 2019,
    event: "Got into AI. Made a text-based depression flagging system. Won 1st place in Software Development Research!",
  },
  {
    year: 2022,
    event: "Got in UMD. Came to the US 🇺🇸.",
  },
  {
    year: 2023,
    event: "1st swe internship",
  },
  {
    year: 2024,
    event: "1st ai internship",
  },
  {
    year: 2025,
    event: "Graduating in Dec!",
  },
];

export default function HeadingSlider() {
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(0);
  const [x, setX] = useState(0);
  const el = useRef(null);

  const index = width > 0 ? Math.round((x / width) * (history.length - 1)) : 0;

  function handleMouseDown() {
    setIsDragging(true);
    window.addEventListener("mousemove", handleChange);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleChange(e) {
    const { left } = el.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setX(Math.max(0, Math.min(clientX - left, width)));
  }

  function handleMouseUp() {
    setIsDragging(false);
    unbindEventListeners();
  }

  function unbindEventListeners() {
    window.removeEventListener("mousemove", handleChange);
    window.removeEventListener("mouseup", handleMouseUp);
  }

  useEffect(() => {
    setWidth(el.current.offsetWidth);

    return () => {
      unbindEventListeners();
    };
  }, []);

  return (
    <div className="text-center h-full relative flex items-center justify-center font-serif">
      <AnimatePresence mode="popLayout">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ ...springConfig }}
          key={index}
          className="md:text-xl mb-4 max-w-[500px] mx-auto"
        >
          {history[index].event}
        </motion.h3>
      </AnimatePresence>
      <div
        ref={el}
        className="inline-flex items-end justify-between gap-2 ml-[-1px] absolute bottom-0"
        style={{ cursor: isDragging ? "grabbing" : "pointer" }}
        onMouseDown={handleMouseDown}
        onTouchMove={handleChange}
        onTouchStart={handleChange}
      >
        {history.map((_, i) => (
          <div
            key={i}
            className={`${
              i === index ? "opacity-100" : "opacity-25"
            } w-[1px] rounded-full transition-all bg-contrast`}
            style={{ height: i % 2 === 0 ? "18px" : "12px" }}
            onClick={() => setX((width / (history.length - 1)) * i)}
          />
        ))}
        <div
          className="absolute w-[1px] bg-contrast rounded-full before:content-[''] before:absolute before:top-[0px] before:left-[-4px] before:text-xs before:text-contrast before:w-[9px] before:h-[9px]  before:rounded-full before:border-[#000] before:border before:bg-acid"
          style={{
            height: 32,
            left: Math.max(0, Math.min(x, width)),
          }}
        >
          <span
            className="absolute top-[-24px] text-xs text-contrast"
            style={{ left: "50%", transform: "translateX(-50%)" }}
          >
            {history[index].year}
          </span>
        </div>
      </div>
    </div>
  );
}
