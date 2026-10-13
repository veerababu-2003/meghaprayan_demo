import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Heart, ShieldCheck, MapPin } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

export const About = () => {
  return (
    <div className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-4">
        <BrandLogo />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          About MeghaPrayan
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The name <strong className="text-slate-800">MeghaPrayan</strong> is derived from Sanskrit: <em>Megha</em> meaning cloud or weather, and <em>Prayan</em> meaning journey. Our mission is to eliminate unexpected weather hazards from roadway journeys.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Why Weather-Aware Navigation?</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Traditional navigation systems treat weather as an afterthought. Drivers often start on sunny highways only to plunge into flash torrential rains, dense mountain fog, or extreme crosswinds. MeghaPrayan proactively samples atmospheric data across every kilometer of the route ahead.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-2">Transparency & Safety Disclaimer</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          MeghaPrayan uses live data from the Open-Meteo meteorological API and routing calculations from the Open Source Routing Machine (OSRM). While we strive for extreme accuracy, meteorological conditions can evolve rapidly. Road recommendations provided by MeghaPrayan represent intelligent algorithmic guidance and should never supersede official local emergency advisories or driver caution.
        </p>
      </div>
    </div>
  );
};

export default About;
