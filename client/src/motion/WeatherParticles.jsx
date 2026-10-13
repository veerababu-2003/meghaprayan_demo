import React, { useEffect, useRef } from 'react';

/**
 * WeatherParticles Canvas Component
 * Renders rain, clouds, sun shimmer, or wind particles based on live weather condition.
 * Automatically throttles, reduces count on mobile, pauses when tab is hidden, and respects reduced motion.
 */
export const WeatherParticles = ({
  condition = 'rain', // 'rain', 'cloud', 'sun', 'wind'
  density = 'medium', // 'low', 'medium', 'high'
  className = ''
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isRunning = true;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleResize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle setup
    const isMobile = window.innerWidth < 768;
    const baseCount = isMobile ? 25 : density === 'low' ? 35 : density === 'high' ? 90 : 55;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2 + 1;

        if (condition === 'rain') {
          this.speedY = Math.random() * 7 + 9;
          this.speedX = Math.random() * 1.5 - 0.75;
          this.length = Math.random() * 14 + 10;
          this.alpha = Math.random() * 0.4 + 0.2;
        } else if (condition === 'wind') {
          this.speedX = Math.random() * 9 + 8;
          this.speedY = Math.random() * 1.5 - 0.75;
          this.length = Math.random() * 25 + 15;
          this.alpha = Math.random() * 0.35 + 0.15;
        } else if (condition === 'cloud') {
          this.speedX = Math.random() * 0.4 + 0.15;
          this.speedY = Math.sin(Math.random() * Math.PI) * 0.1;
          this.radius = Math.random() * 30 + 20;
          this.alpha = Math.random() * 0.12 + 0.04;
        } else {
          // Sun shimmer / dust motes
          this.speedY = Math.random() * -0.6 - 0.2;
          this.speedX = Math.random() * 0.8 - 0.4;
          this.radius = Math.random() * 2.5 + 1;
          this.alpha = Math.random() * 0.4 + 0.2;
        }
      }

      update() {
        this.x += this.speedX || 0;
        this.y += this.speedY || 0;

        if (condition === 'rain' && this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
        } else if (condition === 'wind' && this.x > canvas.width) {
          this.x = -30;
          this.y = Math.random() * canvas.height;
        } else if (condition === 'cloud' && this.x > canvas.width + 50) {
          this.x = -60;
          this.y = Math.random() * canvas.height;
        } else if (condition === 'sun' && this.y < -10) {
          this.y = canvas.height + 10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        if (condition === 'rain') {
          ctx.strokeStyle = `rgba(56, 189, 248, ${this.alpha})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.speedX * 2, this.y + this.length);
          ctx.stroke();
        } else if (condition === 'wind') {
          ctx.strokeStyle = `rgba(203, 213, 225, ${this.alpha})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + this.length, this.y + this.speedY);
          ctx.stroke();
        } else if (condition === 'cloud') {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sun shimmer
          ctx.fillStyle = `rgba(251, 191, 36, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const particles = Array.from({ length: baseCount }, () => new Particle());

    const render = () => {
      if (!isRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        isRunning = true;
        render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};

export default WeatherParticles;
