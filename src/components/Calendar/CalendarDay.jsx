import React from 'react';
import { useDrop } from 'react-dnd';
import { format, isSameMonth, isToday } from 'date-fns';
import { EventItem } from './EventItem';

const CalendarDay = ({ date, events, isCurrentMonth, currentDate, onDayClick, onEventClick, onEventDrop }) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const isCurrentDay = isToday(date);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'EVENT',
    drop: (item) => {
      if (item.date === dateStr) return; // Don't drop on the same day
      onEventDrop(item.id, item.date, dateStr);
    },
    canDrop: (item) => {
      if (item.isRecurring) {
        const sourceDate = new Date(item.date);
        return sourceDate.getDay() === date.getDay();
      }
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      onClick={() => onDayClick(date)}
      className={`min-h-[120px] p-2 border-r border-b relative
        ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
        ${isCurrentDay ? 'ring-2 ring-blue-500 ring-inset' : ''}
        ${isOver && canDrop ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
        ${isOver && !canDrop ? 'bg-red-50 ring-2 ring-red-300' : ''}
        transition-all duration-200`}
    >
      <div className={`flex items-center justify-between mb-2
        ${!isCurrentMonth ? 'text-gray-400' : ''}
        ${isCurrentDay ? 'text-blue-600 font-bold' : ''}`}
      >
        <span className="text-sm">{format(date, 'd')}</span>
        {isCurrentDay && (
          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
            Today
          </span>
        )}
      </div>

      <div className="space-y-1">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarDay; 