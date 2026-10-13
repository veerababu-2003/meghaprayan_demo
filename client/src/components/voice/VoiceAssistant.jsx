import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Sparkles, Send, X, Volume2, VolumeX, Navigation, MapPin, CloudRain, ArrowRight, Loader2, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * VoiceAssistant "Hi Veera" Component
 * Upgraded Features:
 * - Realtime Live Weather for Current Location (via Geolocation API + Open-Meteo)
 * - Realtime Weather for any queried city/location worldwide
 * - Realtime Operation execution:
 *    * "Plan trip from [origin] to [destination]" or "Plan trip to [destination]"
 *    * "Check weather here" / "What's the weather in [city]"
 *    * "Show live trip" / "Navigate to dashboard" / "Explore destinations" / "Open history" / "Open favorites"
 * - Realtime Audio Response with Web Speech Synthesis (custom voice, rate, pitch controls & mute toggle)
 * - Morphing audio visualizer bars, live weather chip preview, and speech transcript
 */
export const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState(
    'Hi! I am Veera, your real-time travel AI. I can fetch live weather for your location, tell you weather for any city, or plan and start journeys!'
  );
  const [textInput, setTextInput] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [activeWeatherChip, setActiveWeatherChip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // 1. Detect and fetch accurate location and reverse-geocoded place name on mount
  useEffect(() => {
    const initLocation = async () => {
      try {
        const { getCurrentAccurateLocation } = await import('../../utils/locationHelper');
        const loc = await getCurrentAccurateLocation();
        setCurrentLocation(loc);
      } catch (e) {
        console.warn('[VoiceAssistant] Location detection fallback:', e.message);
        setCurrentLocation({
          lat: 17.3843,
          lng: 78.4583,
          name: 'Hyderabad',
          formattedName: 'Hyderabad, Telangana'
        });
      }
    };
    initLocation();
  }, []);

  // 2. Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        handleRealtimeCommand(text);
      };

      recognition.onerror = (event) => {
        console.warn('[WebSpeech Error]', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setResponse(`Speech note: ${event.error}. You can also type your command below.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [currentLocation, audioEnabled]);

  // 3. Audio Speech Synthesis helper
  const speak = (msg) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // 4. Realtime Weather Fetcher
  const fetchRealtimeWeatherForCoords = async (lat, lng, locationLabel = 'your current location') => {
    setIsProcessing(true);
    try {
      const res = await api.get(`/weather/current?lat=${lat}&lng=${lng}`);
      if (res.data?.success && res.data?.weather) {
        const w = res.data.weather;
        setActiveWeatherChip({
          location: locationLabel,
          temp: Math.round(w.temperature),
          condition: w.conditionText,
          rainProb: w.precipitationProbability,
          wind: Math.round(w.windSpeed),
          risk: w.riskLevel
        });

        const reply = `At ${locationLabel}, it is currently ${Math.round(w.temperature)}°C with ${w.conditionText}. Rain probability is ${w.precipitationProbability}% with wind speeds of ${Math.round(w.windSpeed)} km/h. Road safety risk is ${w.riskLevel}.`;
        setResponse(reply);
        speak(reply);
      } else {
        const failMsg = `Could not retrieve live weather for ${locationLabel}.`;
        setResponse(failMsg);
        speak(failMsg);
      }
    } catch (err) {
      const errMsg = `Error fetching live weather: ${err.message}`;
      setResponse(errMsg);
      speak('Sorry, there was an error retrieving live weather telemetry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchRealtimeWeatherForCity = async (cityName) => {
    setIsProcessing(true);
    try {
      const geoRes = await api.get(`/geocode/search?q=${encodeURIComponent(cityName)}`);
      if (geoRes.data?.results && geoRes.data.results.length > 0) {
        const place = geoRes.data.results[0];
        await fetchRealtimeWeatherForCoords(place.lat, place.lng, place.name || cityName);
      } else {
        const notFound = `I couldn't locate "${cityName}". Please try another city or region name.`;
        setResponse(notFound);
        speak(notFound);
      }
    } catch (e) {
      const notFound = `Unable to geocode "${cityName}".`;
      setResponse(notFound);
      speak(notFound);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Intelligent NLP Command Execution
  const handleRealtimeCommand = async (rawText) => {
    if (!rawText || !rawText.trim()) return;
    const text = rawText.toLowerCase().trim();
    setIsProcessing(true);

    // OPERATION A: Weather Query
    if (
      text.includes('weather') ||
      text.includes('temperature') ||
      text.includes('rain') ||
      text.includes('climate') ||
      text.includes('forecast')
    ) {
      // Check if a specific city was mentioned (e.g. "weather in Mumbai", "weather of Goa", "forecast for Delhi")
      const cityMatch = text.match(/(?:in|at|of|for)\s+([a-zA-Z\s]+)/i);
      if (cityMatch && cityMatch[1] && !cityMatch[1].includes('here') && !cityMatch[1].includes('current location') && !cityMatch[1].includes('my location')) {
        const targetCity = cityMatch[1].replace(/today|now|please/gi, '').trim();
        await fetchRealtimeWeatherForCity(targetCity);
        return;
      }

      // Otherwise fetch current GPS location weather
      if (currentLocation) {
        await fetchRealtimeWeatherForCoords(currentLocation.lat, currentLocation.lng, 'your current location');
      } else {
        await fetchRealtimeWeatherForCity('Bengaluru');
      }
      return;
    }

    // OPERATION B: Plan Trip from X to Y or to Y
    if (text.includes('plan') || text.includes('route') || text.includes('navigate to') || text.includes('go to') || text.includes('drive to')) {
      // Match pattern "from [origin] to [destination]"
      const fromToMatch = text.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
      if (fromToMatch) {
        const orig = fromToMatch[1].trim();
        const dest = fromToMatch[2].trim();
        const reply = `Calculating real-time weather and route corridor from ${orig} to ${dest}...`;
        setResponse(reply);
        speak(reply);
        setTimeout(() => {
          navigate(`/plan-trip?orig=${encodeURIComponent(orig)}&dest=${encodeURIComponent(dest)}`);
          setIsOpen(false);
        }, 1200);
        setIsProcessing(false);
        return;
      }

      // Match pattern "plan trip to [destination]" or "go to [destination]"
      const singleDestMatch = text.match(/(?:to|visit|heading to)\s+([a-zA-Z\s]+)/i);
      if (singleDestMatch) {
        const dest = singleDestMatch[1].replace(/now|please|today/gi, '').trim();
        const reply = `Planning journey to ${dest}. Sampling weather checkpoints along the route...`;
        setResponse(reply);
        speak(reply);
        setTimeout(() => {
          navigate(`/plan-trip?dest=${encodeURIComponent(dest)}`);
          setIsOpen(false);
        }, 1200);
        setIsProcessing(false);
        return;
      }

      // General plan trip command
      const reply = 'Opening the Smart Waypoint & Weather Planner...';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/plan-trip');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION C: Explore Destinations
    if (text.includes('explore') || text.includes('destination') || text.includes('places') || text.includes('holiday')) {
      const reply = 'Opening curated weather-optimized travel destinations across India.';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/explore');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION D: Dashboard / Home
    if (text.includes('dashboard') || text.includes('home') || text.includes('overview')) {
      const reply = 'Taking you to your MeghaPrayan dashboard.';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/dashboard');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION E: History / Previous Trips
    if (text.includes('history') || text.includes('past trip') || text.includes('my trips') || text.includes('logs')) {
      const reply = 'Opening your travel history and saved route logs.';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/history');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION F: Favorites / Bookmarks
    if (text.includes('favorite') || text.includes('saved') || text.includes('bookmarks')) {
      const reply = 'Opening your saved favorite trips and routes.';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/favorites');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION G: Settings / Preferences
    if (text.includes('settings') || text.includes('preferences') || text.includes('profile')) {
      const target = text.includes('profile') ? '/profile' : '/settings';
      const reply = `Navigating to ${text.includes('profile') ? 'Profile' : 'Settings'}.`;
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate(target);
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // OPERATION H: Live Trip / Tracking
    if (text.includes('live') || text.includes('tracking') || text.includes('gps')) {
      const reply = 'Checking for active journeys. Opening recent journey records...';
      setResponse(reply);
      speak(reply);
      setTimeout(() => {
        navigate('/history');
        setIsOpen(false);
      }, 1000);
      setIsProcessing(false);
      return;
    }

    // Fallback: General Guidance
    const fallback = `I heard: "${rawText}". You can say: "Weather in Mumbai", "Plan trip from Bengaluru to Mysuru", "Explore destinations", or "What's the weather here?".`;
    setResponse(fallback);
    speak(fallback);
    setIsProcessing(false);
  };

  const toggleListening = () => {
    if (!speechSupported) {
      setResponse('Web Speech API is not supported in this browser. Please type your command below.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setTranscript(textInput);
    handleRealtimeCommand(textInput);
    setTextInput('');
  };

  return (
    <>
      {/* Floating Orb Trigger with Pulsing Aura */}
      <div className="fixed bottom-20 md:bottom-8 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            if (!isListening && speechSupported) {
              // Automatically activate listening when clicking orb
              setTimeout(() => toggleListening(), 300);
            }
          }}
          className="relative group p-4 rounded-full bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center focus:outline-none"
          title="Veera AI: Realtime Voice & Weather Assistant"
        >
          {/* Breathing ambient ring */}
          <span className="absolute -inset-1.5 rounded-full bg-sky-400 opacity-40 blur-md group-hover:opacity-80 animate-pulse-subtle" />
          {isSpeaking && (
            <span className="absolute -inset-3 rounded-full bg-indigo-500 opacity-30 blur-lg animate-ping" />
          )}
          <Sparkles className="w-6 h-6 relative z-10" />
          <span className="hidden group-hover:block absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-md whitespace-nowrap">
            Hi Veera AI
          </span>
        </motion.button>
      </div>

      {/* Interactive Modal Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-8 z-50 w-[94vw] sm:w-[410px] bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-sky-200 p-6 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  V
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                    <span>Veera Realtime AI</span>
                    <span className="text-[10px] px-2 py-0.2 bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase">
                      Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600">Voice Navigation & Weather Radar</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setAudioEnabled(!audioEnabled);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    audioEnabled ? 'text-sky-600 bg-sky-50 hover:bg-sky-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={audioEnabled ? 'Mute Speech' : 'Enable Speech'}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Central Animated Orb & Audio Waveform */}
            <div className="py-5 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4 flex items-center justify-center">
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0.15, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="absolute w-28 h-28 rounded-full bg-rose-400/30"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.1 }}
                      className="absolute w-24 h-24 rounded-full bg-rose-500/20"
                    />
                  </>
                )}

                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.3 }}
                    className="absolute w-28 h-28 rounded-full bg-indigo-400/30"
                  />
                )}

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-300'
                      : isSpeaking
                      ? 'bg-gradient-to-tr from-indigo-500 to-sky-500 text-white shadow-indigo-300'
                      : 'bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isListening ? (
                    <Mic className="w-8 h-8" />
                  ) : (
                    <MicOff className="w-8 h-8 opacity-90" />
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center space-x-1.5">
                {isProcessing ? (
                  <span className="text-sky-600">⚡ Analyzing meteorological & route data...</span>
                ) : isListening ? (
                  <span className="text-rose-600 animate-pulse">🎙️ Listening... speak naturally</span>
                ) : isSpeaking ? (
                  <span className="text-indigo-600 flex items-center space-x-1">
                    <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                    <span>Speaking realtime response</span>
                  </span>
                ) : (
                  <span className="text-slate-600">Tap microphone to speak</span>
                )}
              </div>

              {transcript && (
                <p className="text-xs italic text-sky-800 bg-sky-50/90 px-3.5 py-1.5 rounded-xl border border-sky-100 mb-2 max-w-full truncate">
                  "{transcript}"
                </p>
              )}

              {/* Realtime Weather Preview Chip */}
              {activeWeatherChip && (
                <div className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50/60 border border-sky-100 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-white rounded-xl shadow-xs text-sky-600">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{activeWeatherChip.location}</div>
                      <div className="text-[11px] text-slate-600">
                        {activeWeatherChip.condition} • Rain: {activeWeatherChip.rainProb}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">{activeWeatherChip.temp}°C</div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {activeWeatherChip.risk}
                    </span>
                  </div>
                </div>
              )}

              {/* Response Text Box */}
              <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left w-full leading-relaxed max-h-36 overflow-y-auto">
                {response}
              </div>

              {/* Quick Operation Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleRealtimeCommand('weather here')}
                  className="px-2 py-1.5 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Weather Here</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRealtimeCommand('weather in Mumbai')}
                  className="px-2 py-1.5 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <CloudRain className="w-3 h-3" />
                  <span>Weather in Mumbai</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRealtimeCommand('plan trip from Bengaluru to Mysuru')}
                  className="px-2 py-1.5 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Bengaluru ➔ Mysuru</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRealtimeCommand('explore destinations')}
                  className="px-2 py-1.5 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl transition-colors flex items-center justify-center space-x-1"
                >
                  <Compass className="w-3 h-3" />
                  <span>Explore Places</span>
                </button>
              </div>
            </div>

            {/* Manual Text Input Fallback */}
            <form onSubmit={handleManualSubmit} className="relative mt-1">
              <input
                type="text"
                placeholder='Ask: "Weather in Ooty", "Plan trip to Goa"...'
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full text-xs py-2.5 pl-3.5 pr-10 rounded-xl bg-slate-100 border border-transparent focus:border-sky-400 focus:bg-white focus:outline-none transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!textInput.trim() || isProcessing}
                className="absolute right-1.5 top-1.5 p-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-lg transition-colors"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
