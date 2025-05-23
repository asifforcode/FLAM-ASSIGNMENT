import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const WeekView = ({ currentDate, events, onEventClick }) => {
  const weekStart = startOfWeek(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-8 border-b">
        {/* Time column header */}
        <div className="border-r p-2 bg-gray-50"></div>
        
        {/* Day headers */}
        {days.map((day) => (
          <div
            key={day.toString()}
            className="border-r p-2 bg-gray-50 text-center"
          >
            <div className="font-semibold">{format(day, 'EEE')}</div>
            <div className="text-sm text-gray-500">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8">
        {/* Time labels */}
        <div className="border-r">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 border-b p-2 text-sm text-gray-500"
            >
              {format(new Date().setHours(hour), 'ha')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => (
          <div key={day.toString()} className="border-r">
            {hours.map((hour) => {
              const hoursEvents = events.filter((event) => {
                const eventDate = new Date(event.date);
                return (
                  isSameDay(eventDate, day) &&
                  eventDate.getHours() === hour
                );
              });

              return (
                <div
                  key={hour}
                  className="h-20 border-b relative group"
                >
                  {hoursEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`absolute left-0 right-0 mx-1 p-1 rounded text-sm cursor-pointer
                        ${event.priority === 'high' ? 'bg-red-100 text-red-800' :
                          event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          event.priority === 'low' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'}`}
                      style={{
                        top: `${(new Date(event.date).getMinutes() / 60) * 100}%`,
                        height: '50px'
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs truncate">
                        {format(new Date(event.date), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView; 