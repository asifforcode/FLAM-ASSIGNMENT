import React from 'react';
import { format, isSameDay } from 'date-fns';

const DayView = ({ currentDate, events, onEventClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayEvents = events.filter((event) =>
    isSameDay(new Date(event.date), currentDate)
  );

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-1">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter(
            (event) => new Date(event.date).getHours() === hour
          );

          return (
            <div key={hour} className="relative min-h-[100px] border-b group">
              <div className="absolute left-0 top-0 p-2 text-sm text-gray-500 w-20 border-r bg-gray-50">
                {format(new Date().setHours(hour), 'ha')}
              </div>
              
              <div className="ml-20 p-2">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`mb-1 p-2 rounded cursor-pointer transition-all
                      ${event.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        event.priority === 'low' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                    style={{
                      marginTop: `${(new Date(event.date).getMinutes() / 60) * 100}%`,
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs">
                      {format(new Date(event.date), 'h:mm a')}
                      {event.description && (
                        <span className="ml-2 opacity-75">{event.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView; 