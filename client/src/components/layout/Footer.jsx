import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, CloudRain, Shield, Heart, Github, Twitter, MapPin } from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          <div className="md:col-span-1 space-y-4">
            <BrandLogo textClassName="text-white text-xl" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart journeys powered by meteorological data, multi-factor Dijkstra route scoring, and real-time live travel tracking.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/plan-trip" className="hover:text-sky-400 transition-colors">Plan Trip</Link></li>
              <li><Link to="/explore" className="hover:text-sky-400 transition-colors">Explore Destinations</Link></li>
              <li><Link to="/features" className="hover:text-sky-400 transition-colors">Features & Tech</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Travel Intelligence</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-sky-400" />
                <span>Open-Meteo Integration</span>
              </li>
              <li className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Dijkstra Scoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>OSRM Routing Engine</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-sky-400 transition-colors">Safety Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} MeghaPrayan. Travel Smarter. Journey Safer.</p>
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for safe journeys</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
