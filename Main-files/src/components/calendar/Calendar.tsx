import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { taskService } from '../../services/taskService';
import { Task } from '../../types/task';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'MMMM yyyy'));

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const allTasks = taskService.getAllTasks();
    setTasks(allTasks);
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    setSelectedMonth(format(newDate, 'MMMM yyyy'));
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    setSelectedMonth(format(newDate, 'MMMM yyyy'));
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    const [month, year] = event.target.value.split(' ');
    const newDate = new Date(parseInt(year), new Date(`${month} 1, 2000`).getMonth());
    setCurrentDate(newDate);
    setSelectedMonth(event.target.value);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add empty days for the first week
    const firstDay = days[0].getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(new Date(0));
    }

    days.forEach(day => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });

    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0));
    }
    weeks.push(currentWeek);

    return weeks;
  };

  const weeks = renderCalendar();

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2,
        px: 2 
      }}>
        <Select
          value={selectedMonth}
          onChange={handleMonthChange}
          sx={{
            '.MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
          }}
        >
          <MenuItem value={selectedMonth}>{selectedMonth}</MenuItem>
        </Select>
        <Box>
          <IconButton onClick={handlePrevMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextMonth}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 2 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 1, 
          textAlign: 'center',
          mb: 1
        }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <Typography key={day} sx={{ color: theme.palette.text.secondary, fontSize: '0.875rem' }}>
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateRows: `repeat(${weeks.length}, 1fr)`, gap: 1 }}>
          {weeks.map((week, weekIndex) => (
            <Box key={weekIndex} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {week.map((day, dayIndex) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const dayTasks = getTasksForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const hasTask = dayTasks.length > 0;

                return (
                  <Box
                    key={`${weekIndex}-${dayIndex}`}
                    onClick={() => isCurrentMonth && handleDateClick(day)}
                    sx={{
                      position: 'relative',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isCurrentMonth ? 'pointer' : 'default',
                      borderRadius: '50%',
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected 
                        ? 'primary.contrastText' 
                        : isCurrentMonth 
                          ? 'text.primary' 
                          : 'text.disabled',
                      '&:hover': isCurrentMonth ? {
                        bgcolor: isSelected 
                          ? 'primary.dark' 
                          : theme.palette.action.hover,
                      } : {},
                    }}
                  >
                    {isCurrentMonth && (
                      <>
                        <Typography sx={{ fontSize: '0.875rem' }}>
                          {format(day, 'd')}
                        </Typography>
                        {hasTask && (
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: '2px',
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                            }}
                          />
                        )}
                      </>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar; 