import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Trash2, Plus, Clock, X, Lock, ArrowRight } from 'lucide-react';

// --- UTILITY FUNCTIONS ---
const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return timeLeft;
};

// --- COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const NumberBox = ({ value, label, primary = false }) => (
  <div className={`flex flex-col items-center justify-center ${primary ? 'p-4 sm:p-6' : 'p-2'}`}>
    <span className={`font-bold tabular-nums leading-none ${primary ? 'text-5xl sm:text-7xl text-white' : 'text-2xl sm:text-3xl text-white/90'}`}>
      {String(value).padStart(2, '0')}
    </span>
    <span className={`uppercase tracking-widest ${primary ? 'text-xs sm:text-sm mt-2 text-pink-200' : 'text-[10px] mt-1 text-pink-100/70'}`}>
      {label}
    </span>
  </div>
);

// --- LOGIN SCREEN COMPONENT ---
const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // NOTE: For the live Dokploy deployment, you can uncomment the line below 
    // to use the secure environment variable.
    // const envPassword = import.meta.env.VITE_APP_PASSWORD;
    
    // For this preview, we use the fallback directly to avoid build warnings.
    const envPassword = "MySecretPassword123";

    if (password === envPassword) {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000); // Shake effect reset
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-sm p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Private Access</h2>
          <p className="text-white/50 text-sm mt-2">Enter the secret code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Passcode..."
              className={`w-full bg-slate-900/50 border ${error ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-lg px-4 py-3 text-center text-white focus:outline-none focus:border-pink-500 transition-all placeholder:text-white/20 tracking-widest`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            <span>Enter</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </Card>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ldr_auth') === 'true';
  });

  // 2. Event Data State
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('ldr-events');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return [{
      id: 1,
      title: "Reunited with her ❤️",
      date: nextWeek.toISOString().split('T')[0] + "T18:00",
      theme: "pink" 
    }];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', theme: 'blue' });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save events
  useEffect(() => {
    localStorage.setItem('ldr-events', JSON.stringify(events));
  }, [events]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('ldr_auth', 'true'); // Persist login so you don't type it every time
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ldr_auth');
  }

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ title: '', date: '', theme: 'blue' });
    setShowAddModal(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  // --- RENDERING ---

  // If not logged in, show the Gatekeeper
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // If logged in, show the App
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  const heroEvent = sortedEvents[0];
  const otherEvents = sortedEvents.slice(1);
  const heroTimeLeft = heroEvent ? calculateTimeLeft(heroEvent.date) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-pink-500 selection:text-white">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
         <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 sm:mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-pink-500/20 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-pink-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white/90">Our Time</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Event</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center bg-white/5 hover:bg-red-500/20 hover:text-red-300 transition-colors px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10"
              title="Lock App"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* HERO SECTION */}
        {heroEvent ? (
          <div className="mb-12 animate-fade-in-up">
            <span className="block text-center text-pink-300 font-medium tracking-widest uppercase text-xs sm:text-sm mb-4">
              Next Priority Event
            </span>
            <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-pink-500/30">
              <h2 className="text-3xl sm:text-5xl font-bold mb-8 sm:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
                {heroEvent.title}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <NumberBox value={heroTimeLeft.days} label="Days" primary />
                <NumberBox value={heroTimeLeft.hours} label="Hours" primary />
                <NumberBox value={heroTimeLeft.minutes} label="Minutes" primary />
                <NumberBox value={heroTimeLeft.seconds} label="Seconds" primary />
              </div>

              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 text-white/40 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(heroEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
              
              <button 
                onClick={() => deleteEvent(heroEvent.id)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 transition-colors"
                title="Remove event"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 text-white/50">
            <p>No countdowns set. Add one to get started!</p>
          </div>
        )}

        {/* GRID SECTION */}
        {otherEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up delay-100">
            {otherEvents.map(event => {
              const tl = calculateTimeLeft(event.date);
              return (
                <Card key={event.id} className="p-6 relative group hover:bg-white/15 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white/90 group-hover:text-white transition-colors">
                      {event.title}
                    </h3>
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <NumberBox value={tl.days} label="d" />
                    <NumberBox value={tl.hours} label="h" />
                    <NumberBox value={tl.minutes} label="m" />
                    <NumberBox value={tl.seconds} label="s" />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-center text-white/40">
                     {new Date(event.date).toLocaleDateString()}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto py-8 text-center text-white/20 text-sm">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="w-3 h-3 text-red-500 fill-current" /> for Long Distance
          </p>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-800 border-slate-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Countdown</h2>
                <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Event Title</label>
                  <input
                    autoFocus
                    type="text"
                    required
                    placeholder="e.g. Flight to NYC ✈️"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                >
                  Start Countdown
                </button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}