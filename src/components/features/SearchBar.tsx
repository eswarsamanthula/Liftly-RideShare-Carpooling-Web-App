import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getLocationRecommendations } from '@/lib/mongodb';

interface SearchBarProps {
  variant?: 'homepage' | 'page';
}

export default function SearchBar({ variant = 'homepage' }: SearchBarProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch suggestions for "from"
  useEffect(() => {
    let active = true;
    if (from.length > 2) {
      getLocationRecommendations(from).then((suggestions) => {
        if (active) setFromSuggestions(suggestions);
      });
    } else {
      setFromSuggestions([]);
    }
    return () => { active = false };
  }, [from]);

  // Fetch suggestions for "to"
  useEffect(() => {
    let active = true;
    if (to.length > 2) {
      getLocationRecommendations(to).then((suggestions) => {
        if (active) setToSuggestions(suggestions);
      });
    } else {
      setToSuggestions([]);
    }
    return () => { active = false };
  }, [to]);

  // Properly close the dropdown when clicking outside or blur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        fromInputRef.current &&
        !fromInputRef.current.contains(e.target as Node)
      ) {
        setShowFromSuggestions(false);
      }
      if (
        toInputRef.current &&
        !toInputRef.current.contains(e.target as Node)
      ) {
        setShowToSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      alert('Please enter both departure and destination locations');
      return;
    }
    const searchParams = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      ...(date && { date: format(date, 'yyyy-MM-dd') }),
      passengers: passengers.toString(),
    });
    navigate(`/search?${searchParams.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setFrom(suggestion);
      setShowFromSuggestions(false);
      toInputRef.current?.focus();
    } else {
      setTo(suggestion);
      setShowToSuggestions(false);
    }
  };

  const incrementPassengers = () => {
    if (passengers < 8) setPassengers(passengers + 1);
  };

  const decrementPassengers = () => {
    if (passengers > 1) setPassengers(passengers - 1);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto bg-black/20 backdrop-blur-md rounded-full shadow-2xl border border-white/20 p-3 mt-8">
      <div className="flex items-center h-16">
        {/* From Location */}
        <div className="flex-1 relative px-6">
          <div className="flex items-center h-full">
            <MapPin className="w-5 h-5 text-white/80 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/90 mb-1">From</label>
              <input
                ref={fromInputRef}
                placeholder=""
                value={from}
                onChange={e => {
                  setFrom(e.target.value);
                  setShowFromSuggestions(true);
                }}
                onFocus={() => setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 160)}
                className="w-full bg-transparent border-0 outline-0 text-white text-base placeholder-white/60 font-medium"
                autoComplete="off"
              />
            </div>
          </div>
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <div className="absolute mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 border border-gray-100">
              {fromSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-base text-gray-700 border-b border-gray-100 last:border-b-0"
                  tabIndex={-1}
                  onClick={() => handleSuggestionClick(suggestion, 'from')}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20"></div>

        {/* To Location */}
        <div className="flex-1 relative px-6">
          <div className="flex items-center h-full">
            <MapPin className="w-5 h-5 text-white/80 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/90 mb-1">To</label>
              <input
                ref={toInputRef}
                placeholder=""
                value={to}
                onChange={e => {
                  setTo(e.target.value);
                  setShowToSuggestions(true);
                }}
                onFocus={() => setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 160)}
                className="w-full bg-transparent border-0 outline-0 text-white text-base placeholder-white/60 font-medium"
                autoComplete="off"
              />
            </div>
          </div>
          {showToSuggestions && toSuggestions.length > 0 && (
            <div className="absolute mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 border border-gray-100">
              {toSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-base text-gray-700 border-b border-gray-100 last:border-b-0"
                  tabIndex={-1}
                  onClick={() => handleSuggestionClick(suggestion, 'to')}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20"></div>

        {/* Date */}
        <div className="flex-1 px-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-full justify-start text-left bg-transparent border-0 hover:bg-transparent focus:ring-0 p-0"
              >
                <CalendarIcon className="w-5 h-5 text-white/80 mr-3" />
                <div>
                  <div className="block text-sm font-medium text-white/90 mb-1">Date</div>
                  <div className="text-base font-medium text-white">
                    {date ? format(date, "MMM dd, yyyy") : ""}
                  </div>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-2xl border border-gray-100" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < today}
                initialFocus
                className="p-4"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20"></div>

        {/* Passengers */}
        <div className="flex-1 px-6">
          <div className="flex items-center h-full">
            <Users className="w-5 h-5 text-white/80 mr-3" />
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/90 mb-1">Passengers</label>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-white">
                  {passengers}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementPassengers}
                    disabled={passengers <= 1}
                    className="h-6 w-6 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                    type="button"
                    tabIndex={-1}
                  >
                    -
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementPassengers}
                    disabled={passengers >= 8}
                    className="h-6 w-6 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-50"
                    type="button"
                    tabIndex={-1}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0 pl-4">
          <Button 
            onClick={handleSearch}
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg font-semibold text-base rounded-full flex items-center gap-3 text-white border-0"
          >
            <Search className="w-5 h-5" />
            Find My Ride
          </Button>
        </div>
      </div>
    </div>
  );
}