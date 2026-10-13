import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, ShieldCheck, CloudRain, Navigation, CheckCircle2, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import WeatherParticles from '../motion/WeatherParticles';
import Reveal from '../motion/Reveal';
import Stagger, { StaggerItem } from '../motion/Stagger';
import CountUp from '../motion/CountUp';
import WeatherCard from '../components/weather/WeatherCard';
import api from '../services/api';

export const Landing = () => {
  const navigate = useNavigate();
  const [liveWeather, setLiveWeather] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [locationLabel, setLocationLabel] = useState('Local Radar');

  // Fetch real Open-Meteo weather for visitor's accurate location
  useEffect(() => {
    const fetchLandingWeather = async () => {
      try {
        const { getCurrentAccurateLocation } = await import('../utils/locationHelper');
        const loc = await getCurrentAccurateLocation();
        setLocationLabel(loc.formattedName || loc.name || 'Local Radar');
        const res = await api.get(`/weather/current?lat=${loc.lat}&lng=${loc.lng}`);
        if (res.data.success) {
          setLiveWeather(res.data.weather);
        }
      } catch (e) {
        console.warn('Weather fetch fallback');
      }
    };
    fetchLandingWeather();
  }, []);

  const features = [
    {
      title: 'Dijkstra Multi-Factor Scoring',
      desc: 'Transparent graph-based route optimization weighting distance, duration, and atmospheric hazards.',
      icon: Compass,
      color: 'bg-sky-50 text-sky-600 border-sky-100'
    },
    {
      title: 'Microclimate Timeline',
      desc: 'Samples Open-Meteo forecasts along travel corridors at your predicted arrival hour.',
      icon: CloudRain,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    },
    {
      title: 'Adaptive Vehicle Advice',
      desc: 'Rule-based recommendations between cars, two-wheelers, and rail based on wind gusts and rainfall.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    },
    {
      title: 'Real-Time Socket Tracking',
      desc: 'Stream your journey coordinates with live atmospheric telemetry and dynamic ETA updates.',
      icon: Navigation,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    }
  ];

  const steps = [
    { num: '01', title: 'Set Start & Destination', desc: 'Type places with debounced autocomplete or tap directly on the interactive map.' },
    { num: '02', title: 'OSRM Route Computation', desc: 'Fetches road geometries and real-world alternative routes instantaneously.' },
    { num: '03', title: 'Corridor Weather Sampling', desc: 'Open-Meteo queries atmospheric metrics at every waypoint ahead of time.' },
    { num: '04', title: 'Algorithmic Safety Scoring', desc: 'Evaluates composite risk factors and generates plain-language explanations.' },
    { num: '05', title: 'Live Trip Telemetry', desc: 'Broadcasts position via WebSockets with continuous weather radar.' }
  ];

  return (
    <div className="relative min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-white">
        {/* Ambient weather particles */}
        <WeatherParticles condition="sun" density="low" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <Reveal direction="down" delay={0.1}>
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Next-Gen Meteorological Route Planner</span>
                </div>
              </Reveal>

              <Reveal direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Travel Smarter. <br />
                  <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
                    Journey Safer.
                  </span>
                </h1>
              </Reveal>

              <Reveal direction="up" delay={0.3}>
                <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  MeghaPrayan combines OSRM route calculations, Open-Meteo forecasts along your route, and Dijkstra multi-factor scoring to ensure you never get blindsided by adverse weather.
                </p>
              </Reveal>

              <Reveal direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                  <Link
                    to="/plan-trip"
                    className="w-full sm:w-auto px-7 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all flex items-center justify-center space-x-2 group"
                  >
                    <span>Plan Your Journey</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/explore"
                    className="w-full sm:w-auto px-7 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Explore Destinations</span>
                  </Link>
                </div>
              </Reveal>

              {/* Stats badges */}
              <Reveal direction="up" delay={0.5}>
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      <CountUp end={100} suffix="%" />
                    </div>
                    <div className="text-xs text-slate-600 font-medium">Real Meteorological Data</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      <CountUp end={3} suffix=" Waypoint" />
                    </div>
                    <div className="text-xs text-slate-600 font-medium">Alternative Analyses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      <CountUp end={60} suffix="fps" />
                    </div>
                    <div className="text-xs text-slate-600 font-medium">Motion Engine</div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <Reveal direction="left" delay={0.3}>
                <div className="relative">
                  {/* Floating weather card */}
                  <div className="rounded-3xl shadow-xl border border-sky-100 overflow-hidden bg-white/90 backdrop-blur-md p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Radar Sample</span>
                      </div>
                      <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{locationLabel}</span>
                    </div>

                    <div className="pt-4">
                      {liveWeather ? (
                        <WeatherCard weather={liveWeather} title="Real-Time Station Feed" showParticles={false} />
                      ) : (
                        <div className="animate-pulse space-y-3 py-6">
                          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      )}
                    </div>

                    {/* Quick Simulation Graphic */}
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Route Corridor</span>
                        <span className="text-emerald-700">96/100 Safety Score</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-sky-400 to-emerald-500 h-2.5 rounded-full w-[96%]"></div>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        Dijkstra analysis: Ideal dry asphalt conditions ahead with zero thunderstorm risks.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">Core Capabilities</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              Engineered for Uncompromising Road Safety
            </h3>
            <p className="text-slate-600 text-sm mt-3">
              Standard navigation ignores weather until you are stranded. MeghaPrayan recalculates based on precipitation, wind sheer, and temperature extremes.
            </p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <StaggerItem key={idx}>
                  <div className="h-full bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-6 ${feat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 3. HOW IT WORKS 5-STEP TIMELINE */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">Workflow</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">How MeghaPrayan Works</h3>
            <p className="text-slate-600 text-sm mt-3">
              From origin selection to real-time travel telemetry in five coordinated steps.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((st, index) => (
              <Reveal key={index} direction="up" delay={index * 0.1}>
                <div className="flex items-start space-x-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-base flex items-center justify-center flex-shrink-0 shadow-sm">
                    {st.num}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{st.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/plan-trip"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-lg transition-all"
            >
              <span>Test The Route Engine Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
