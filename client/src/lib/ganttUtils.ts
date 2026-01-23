import { ViewSettings } from '@/types/gantt';
import { differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, eachWeekOfInterval, eachDayOfInterval, format, addDays } from 'date-fns';

export function getXForDate(date: Date, startDate: Date, columnWidth: number, zoomLevel: ViewSettings['zoomLevel']): number {
  const diffDays = differenceInDays(date, startDate);
  
  if (zoomLevel === 'day') {
    return diffDays * columnWidth;
  } else if (zoomLevel === 'week') {
    return (diffDays / 7) * columnWidth;
  } else if (zoomLevel === 'month') {
    // Approximation for month view, or we can be precise
    return (diffDays / 30) * columnWidth; 
  }
  
  return diffDays * columnWidth; // Default
}

export function getDateForX(x: number, startDate: Date, columnWidth: number, zoomLevel: ViewSettings['zoomLevel']): Date {
  let daysToAdd = 0;
  
  if (zoomLevel === 'day') {
    daysToAdd = x / columnWidth;
  } else if (zoomLevel === 'week') {
    daysToAdd = (x / columnWidth) * 7;
  } else if (zoomLevel === 'month') {
    daysToAdd = (x / columnWidth) * 30;
  }
  
  return addDays(startDate, Math.round(daysToAdd));
}

export function generateTimeTicks(startDate: Date, endDate: Date, zoomLevel: ViewSettings['zoomLevel']) {
  if (zoomLevel === 'month') {
    return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
      date,
      label: format(date, 'MMM yyyy'),
      subLabel: format(date, 'Q')
    }));
  } else if (zoomLevel === 'week') {
    return eachWeekOfInterval({ start: startDate, end: endDate }).map(date => ({
      date,
      label: format(date, "'W'w"),
      subLabel: format(date, 'MMM')
    }));
  } else {
    return eachDayOfInterval({ start: startDate, end: endDate }).map(date => ({
      date,
      label: format(date, 'd'),
      subLabel: format(date, 'EE')
    }));
  }
}
