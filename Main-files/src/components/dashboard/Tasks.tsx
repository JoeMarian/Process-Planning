import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Task, Priority, TASK_COLORS } from '../../types/task';
import { taskService, USERS } from '../../services/taskService';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';

interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  assignedTo: string;
  priority: Priority;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    priority: 'medium',
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(taskService.getAllTasks());
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: '',
      priority: 'medium',
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      priority: task.priority,
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (editingTask) {
      taskService.updateTask(editingTask.id, { ...newTask, status: editingTask.status });
    } else {
      taskService.addTask({ ...newTask, status: 'pending' });
    }
    loadTasks();
    handleClose();
  };

  const handleDelete = (taskId: number) => {
    taskService.deleteTask(taskId);
    loadTasks();
  };

  const handleToggleStatus = (taskId: number) => {
    taskService.toggleTaskStatus(taskId);
    loadTasks();
  };

  const getPriorityColor = (priority: Priority) => TASK_COLORS[priority];

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewTask({ ...newTask, dueDate: date.toISOString() });
    }
  };

  const TaskList = ({ status }: { status: 'pending' | 'completed' }) => (
    <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" gutterBottom>
        {status === 'pending' ? 'Pending Tasks' : 'Completed Tasks'} ({tasks.filter(t => t.status === status).length})
      </Typography>
      {tasks
        .filter(task => task.status === status)
        .map(task => (
          <Paper
            key={task.id}
            sx={{
              p: 2,
              mb: 2,
              borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Priority: {task.priority} | Assigned to: {task.assignedTo} | Due: {formatDate(task.dueDate)}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleEdit(task)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(task.id)} size="small">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            <Button
              sx={{ mt: 1 }}
              size="small"
              onClick={() => handleToggleStatus(task.id)}
              color={status === 'pending' ? 'success' : 'warning'}
            >
              Mark as {status === 'pending' ? 'Complete' : 'Pending'}
            </Button>
          </Paper>
        ))}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4">Task Management</Typography>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Add New Task
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskList status="pending" />
        </Grid>

        <Grid item xs={12} md={6}>
          <TaskList status="completed" />
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={newTask.assignedTo}
                label="Assigned To"
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                {USERS.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date"
                value={new Date(newTask.dueDate)}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal'
                  }
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? 'Save Changes' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks; 