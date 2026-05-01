import React from 'react';
import { motion } from 'framer-motion';

const CheckMateLogo = ({ size = "large", animated = true, layout }) => {
  const isLarge = size === "large";
  // Default layout logic: Large logos (splash screens) are vertical, Small logos (headers) are horizontal
  // This can be overridden by the layout prop ('vertical' or 'horizontal')
  const isVertical = layout ? layout === 'vertical' : isLarge;
  
  // Styling configurations based on size
  const strokeWidth = isLarge ? 6 : 5;
  const iconSize = isLarge ? "w-24 h-24" : "w-10 h-10";
  const textSize = isLarge ? "text-5xl" : "text-2xl";
  const gapSize = isVertical ? "gap-6" : "gap-3";
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1] // Custom easeOutQuint-like bezier for premium feel
      }
    }
  };

  // SVG Paths
  // Circle: Draws a perfect circle
  const circlePath = "M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0";
  // Check: A balanced checkmark centered within the circle
  const checkPath = "M 32 50 L 45 63 L 70 38";

  return (
    <motion.div 
      className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center justify-center ${gapSize}`}
      initial={animated ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Icon Container */}
      <div className={`${iconSize} text-indigo-600 relative flex-shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
          {/* Faint Background Circle */}
          <motion.path
            d={circlePath}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeOpacity={0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          
          {/* Animated Drawing Circle */}
          <motion.path
            d={circlePath}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={pathVariants}
            className="origin-center -rotate-90" // Start drawing from top
          />
          
          {/* Animated Drawing Checkmark */}
          <motion.path
            d={checkPath}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={pathVariants}
          />
        </svg>
      </div>

      {/* Wordmark */}
      <motion.div 
        className={`flex flex-col ${isVertical ? 'items-center text-center' : 'items-start text-left'}`}
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }
        }}
      >
        <h1 className={`${textSize} font-black tracking-tighter text-gray-900 leading-none`}>
          UA<span className="text-indigo-600">ble</span>
        </h1>
        {isLarge && (
          <p className="text-gray-500 font-bold tracking-[0.3em] uppercase text-xs mt-3">
            Versant Test Platform
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CheckMateLogo;