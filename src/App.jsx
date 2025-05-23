import React, { useState, useEffect } from 'react';
import { addMonths, subMonths, format, parseISO } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MonthView from './components/Calendar/MonthView';
import WeekView from './components/Calendar/WeekView';
import DayView from './components/Calendar/DayView';
import EventForm from './components/Events/EventForm';
import {
  loadEventsFromLocalStorage,
  saveEventsToLocalStorage,
  checkEventConflicts,
} from './utils/eventUtils';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month'); // 'month', 'week', or 'day'

  useEffect(() => {
    const savedEvents = loadEventsFromLocalStorage();
    setEvents(savedEvents);
  }, []);

  const handlePreviousClick = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (view === 'week' ? 7 : 1))));
    }
  };

  const handleNextClick = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (view === 'week' ? 7 : 1))));
    }
  };

  const handleDayClick = (date) => {
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventForm(true);
  };

  const handleEventDrop = (eventId, sourceDate, destinationDate) => {
    const eventToUpdate = events.find((e) => e.id === eventId);
    if (!eventToUpdate) return;

    // If it's a recurring event instance, we need to handle it differently
    if (eventToUpdate.isRecurring) {
      // Create a new non-recurring event from this instance
      const newEvent = {
        ...eventToUpdate,
        id: Date.now().toString(),
        isRecurring: false,
        recurrence: 'none',
        originalEventId: undefined,
      };

      const newDate = parseISO(destinationDate);
      const oldDate = new Date(eventToUpdate.date);
      
      // Preserve the time while updating the date
      newDate.setHours(oldDate.getHours());
      newDate.setMinutes(oldDate.getMinutes());
      
      newEvent.date = newDate;

      // Check for conflicts
      const otherEvents = events.filter((e) => e.id !== eventId);
      if (checkEventConflicts(newEvent, otherEvents)) {
        alert('Cannot move event due to conflict with existing event!');
        return;
      }

      // Add the new event to the list
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      saveEventsToLocalStorage(updatedEvents);
      return;
    }

    // Handle regular non-recurring events
    const newDate = parseISO(destinationDate);
    const oldDate = new Date(eventToUpdate.date);
    
    // Preserve the time while updating the date
    newDate.setHours(oldDate.getHours());
    newDate.setMinutes(oldDate.getMinutes());

    const updatedEvent = {
      ...eventToUpdate,
      date: newDate,
    };

    // Check for conflicts
    const otherEvents = events.filter((e) => e.id !== eventId);
    if (checkEventConflicts(updatedEvent, otherEvents)) {
      alert('Cannot move event due to conflict with existing event!');
      return;
    }

    const updatedEvents = events.map((e) =>
      e.id === eventId ? updatedEvent : e
    );

    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
  };

  const handleEventSubmit = (eventData) => {
    const newEvent = {
      ...eventData,
      id: selectedEvent ? selectedEvent.id : Date.now().toString(),
    };

    // Check for conflicts
    const otherEvents = events.filter((e) => e.id !== (selectedEvent?.id || ''));
    if (checkEventConflicts(newEvent, otherEvents)) {
      alert('This event conflicts with an existing event!');
      return;
    }

    let updatedEvents;
    if (selectedEvent) {
      updatedEvents = events.map((e) => (e.id === selectedEvent.id ? newEvent : e));
    } else {
      updatedEvents = [...events, newEvent];
    }

    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    setEvents(updatedEvents);
    saveEventsToLocalStorage(updatedEvents);
    setShowEventForm(false);
    setSelectedEvent(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
        {/* Interactive Heading */}
        <div className="max-w-6xl mx-auto mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2 transform hover:scale-105 transition-transform duration-300">
            Event Calendar
          </h1>
          <p className="text-gray-600 text-lg animate-fade-in">
            Organize your schedule with style
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handlePreviousClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-xl text-blue-600">←</span>
                </button>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  {format(currentDate, 
                    view === 'month' ? 'MMMM yyyy' : 
                    view === 'week' ? "'Week of' MMM d, yyyy" : 
                    'EEEE, MMMM d, yyyy'
                  )}
                </h2>
                <button
                  onClick={handleNextClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-xl text-blue-600">→</span>
                </button>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setView('month')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md transition-colors duration-200 ${
                      view === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      view === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setView('day')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md transition-colors duration-200 ${
                      view === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Day
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setShowEventForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Add Event</span>
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Calendar Views */}
            <div className="bg-white rounded-lg overflow-hidden">
              {view === 'month' && (
                <MonthView
                  currentDate={currentDate}
                  events={events}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                  onEventDrop={handleEventDrop}
                />
              )}
              {view === 'week' && (
                <WeekView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                />
              )}
              {view === 'day' && (
                <DayView
                  currentDate={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <EventForm
                event={selectedEvent}
                onSubmit={handleEventSubmit}
                onDelete={handleEventDelete}
                onClose={() => {
                  setShowEventForm(false);
                  setSelectedEvent(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
