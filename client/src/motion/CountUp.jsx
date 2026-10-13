import React, { useEffect, useState } from 'react';

export const CountUp = ({ end, duration = 1.2, decimals = 0, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const startValue = 0;
    const endValue = Number(end);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // EaseOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(startValue + (endValue - startValue) * easeProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
};

export default CountUp;
