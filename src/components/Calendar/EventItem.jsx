import React from 'react';
import { useDrag } from 'react-dnd';
import { format } from 'date-fns';

const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const EventItem = ({ event, onClick }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'EVENT',
    item: { ...event },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityStyles = getPriorityStyles(event.priority);

  return (
    <div
      ref={drag}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
      style={{
        cursor: event.isRecurring ? 'default' : 'grab',
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`
        p-1 mb-1 rounded text-sm cursor-pointer border
        transition-all duration-200
        ${priorityStyles}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:shadow-md
        ${event.isRecurring ? '' : 'hover:ring-2 hover:ring-blue-400 hover:ring-opacity-50'}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      <div className="font-medium truncate">{event.title}</div>
      {event.isRecurring && (
        <div className="text-xs opacity-75">↻ Recurring</div>
      )}
    </div>
  );
}; 