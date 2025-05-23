import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import CalendarDay from './CalendarDay';
import SearchBar from './SearchBar';

const MonthView = ({ currentDate, events, onDayClick, onEventClick, onEventDrop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Filter events based on search term and priority
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = selectedPriority === '' || event.priority === selectedPriority;
      
      return matchesSearch && matchesPriority;
    });
  }, [events, searchTerm, selectedPriority]);

  return (
    <div className="space-y-4">
      <SearchBar
        searchTerm={searchTerm}
        category={selectedPriority}
        onSearchChange={setSearchTerm}
        onCategoryChange={setSelectedPriority}
      />

      <div className="rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-l border-gray-200">
          {daysInCalendar.map((date) => {
            const dayEvents = filteredEvents.filter((event) =>
              isSameDay(new Date(event.date), date)
            );

            return (
              <CalendarDay
                key={format(date, 'yyyy-MM-dd')}
                date={date}
                events={dayEvents}
                isCurrentMonth={isSameMonth(date, currentDate)}
                currentDate={currentDate}
                onDayClick={onDayClick}
                onEventClick={onEventClick}
                onEventDrop={onEventDrop}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonthView;