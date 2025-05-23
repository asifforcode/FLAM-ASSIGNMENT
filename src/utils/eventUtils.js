import {
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  setDate,
  isSameMonth,
  addYears,
} from 'date-fns';

export const generateRecurringEvents = (event, startDate, endDate) => {
  if (!event.recurrence || event.recurrence === 'none') {
    return [event];
  }

  const events = [];
  let currentDate = new Date(event.date);
  const maxRecurrences = 100; // Limit to prevent infinite loops
  let recurrenceCount = 0;

  const addEventIfInRange = (date) => {
    if (date >= startDate && date <= endDate && recurrenceCount < maxRecurrences) {
      events.push({
        ...event,
        date: new Date(date),
        id: `${event.id}-${date.getTime()}`,
        isRecurring: true,
        originalEventId: event.id,
      });
      recurrenceCount++;
    }
  };

  // Helper function to check if a day should be included in weekly recurrence
  const shouldIncludeWeekDay = (date, weekdays) => {
    if (!weekdays || weekdays.length === 0) {
      // If no specific days are selected, use the original event's day
      return getDay(date) === getDay(new Date(event.date));
    }
    return weekdays.includes(getDay(date));
  };

  // For monthly recurrence, maintain the same day of the month
  const originalDayOfMonth = currentDate.getDate();

  while (currentDate <= endDate) {
    switch (event.recurrence) {
      case 'daily':
        addEventIfInRange(currentDate);
        currentDate = addDays(currentDate, 1);
        break;

      case 'weekly':
        if (shouldIncludeWeekDay(currentDate, event.customRecurrence?.weekdays)) {
          addEventIfInRange(currentDate);
        }
        currentDate = addDays(currentDate, 1);
        break;

      case 'monthly':
        // Check if the day exists in the current month
        const lastDayOfMonth = endOfMonth(currentDate);
        const targetDate = Math.min(originalDayOfMonth, lastDayOfMonth.getDate());
        const monthlyDate = setDate(currentDate, targetDate);
        
        if (isSameMonth(currentDate, monthlyDate)) {
          addEventIfInRange(monthlyDate);
        }
        currentDate = addMonths(currentDate, 1);
        currentDate = setDate(currentDate, 1); // Reset to first day of month
        break;

      case 'custom':
        const { frequency, interval = 1 } = event.customRecurrence || {};
        
        if (frequency === 'weekly') {
          if (shouldIncludeWeekDay(currentDate, event.customRecurrence?.weekdays)) {
            addEventIfInRange(currentDate);
          }
          // Move to next day, but jump by interval weeks when completing a week
          if (getDay(currentDate) === 6) { // If it's Saturday
            currentDate = addWeeks(currentDate, interval - 1); // Add remaining weeks from interval
          }
          currentDate = addDays(currentDate, 1);
        } else if (frequency === 'monthly') {
          const customMonthlyDate = setDate(currentDate, originalDayOfMonth);
          if (isSameMonth(currentDate, customMonthlyDate)) {
            addEventIfInRange(customMonthlyDate);
          }
          currentDate = addMonths(currentDate, interval);
          currentDate = setDate(currentDate, 1);
        }
        break;

      default:
        return events;
    }

    // Safety check to prevent infinite loops
    if (recurrenceCount >= maxRecurrences) {
      console.warn('Maximum number of recurring events reached');
      break;
    }
  }

  return events;
};

export const getEventsForMonth = (events, date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Extend the range to include events that might recur into this month
  const extendedStart = addMonths(monthStart, -3);
  const extendedEnd = addMonths(monthEnd, 3);

  const allEvents = events.flatMap((event) =>
    generateRecurringEvents(event, extendedStart, extendedEnd)
  );

  return daysInMonth.map((day) => ({
    date: day,
    events: allEvents.filter((event) => isSameDay(new Date(event.date), day)),
  }));
};

export const checkEventConflicts = (newEvent, existingEvents) => {
  // For recurring events, we need to check conflicts within a reasonable time frame
  const startDate = new Date(newEvent.date);
  const endDate = addYears(startDate, 1); // Check conflicts for up to one year

  // Generate all instances of the new event
  const newEventInstances = generateRecurringEvents(newEvent, startDate, endDate);

  // Generate all instances of existing events
  const existingEventInstances = existingEvents.flatMap((event) =>
    generateRecurringEvents(event, startDate, endDate)
  );

  // Check for conflicts
  return newEventInstances.some((newInstance) => {
    const newStart = new Date(newInstance.date);
    const newEnd = new Date(newInstance.date);
    newEnd.setHours(newEnd.getHours() + 1); // Assuming 1-hour duration

    return existingEventInstances.some((existingInstance) => {
      const existingStart = new Date(existingInstance.date);
      const existingEnd = new Date(existingInstance.date);
      existingEnd.setHours(existingEnd.getHours() + 1);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  });
};

export const saveEventsToLocalStorage = (events) => {
  localStorage.setItem('calendarEvents', JSON.stringify(events));
};

export const loadEventsFromLocalStorage = () => {
  const events = localStorage.getItem('calendarEvents');
  return events ? JSON.parse(events) : [];
}; 