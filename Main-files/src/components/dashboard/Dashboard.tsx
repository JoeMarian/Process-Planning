import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Menu,
  Tab,
  Tabs,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { taskService } from '../../services/taskService';
import { TaskStats, Task } from '../../types/task';
import Calendar from '../calendar/Calendar';
import TaskComments from './TaskComments';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<TaskStats>(taskService.getTaskStats());
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMember, setSelectedMember] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSprint, setSelectedSprint] = useState('Sprint 1');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);

  // Mock data for performance graphs
  const performanceData = [
    { week: 'Week 4', Joe: 100, Jabin: 0, Sarah: 50 },
    { week: 'Week 3', Joe: 75, Jabin: 25, Sarah: 40 },
    { week: 'Week 2', Joe: 50, Jabin: 35, Sarah: 30 },
    { week: 'Week 1', Joe: 25, Jabin: 50, Sarah: 20 },
  ];

  const workTypeData = [
    { name: 'Bug Fix', completed: 3, pending: 2 },
    { name: 'Feature', completed: 2, pending: 1 },
    { name: 'Documentation', completed: 1, pending: 2 },
    { name: 'Testing', completed: 2, pending: 1 },
  ];

  const workloadData = [
    { name: 'Joe', completed: 5, pending: 3 },
    { name: 'Jabin', completed: 3, pending: 2 },
    { name: 'Sarah', completed: 4, pending: 1 },
  ];

  // New mock data for radar chart
  const skillsData = [
    { subject: 'Frontend', Joe: 90, Jabin: 80, Sarah: 70 },
    { subject: 'Backend', Joe: 75, Jabin: 85, Sarah: 80 },
    { subject: 'DevOps', Joe: 60, Jabin: 90, Sarah: 65 },
    { subject: 'Testing', Joe: 85, Jabin: 70, Sarah: 90 },
    { subject: 'Design', Joe: 70, Jabin: 65, Sarah: 85 },
  ];

  // Deadline analysis data
  const deadlineData = [
    { status: 'On Time', count: 15 },
    { status: 'Late', count: 3 },
    { status: 'At Risk', count: 5 },
  ];

  // Add new mock data for sprint planning
  const sprintData = [
    { day: 1, planned: 100, actual: 95 },
    { day: 2, planned: 90, actual: 85 },
    { day: 3, planned: 80, actual: 78 },
    { day: 4, planned: 70, actual: 68 },
    { day: 5, planned: 60, actual: 55 },
    { day: 6, planned: 50, actual: 48 },
    { day: 7, planned: 40, actual: 35 },
    { day: 8, planned: 30, actual: 28 },
    { day: 9, planned: 20, actual: 18 },
    { day: 10, planned: 10, actual: 8 },
  ];

  const taskPredictions = [
    { task: 'API Integration', prediction: 85, complexity: 'High' },
    { task: 'UI Design', prediction: 92, complexity: 'Medium' },
    { task: 'Testing', prediction: 78, complexity: 'Low' },
  ];

  const resourceUtilization = [
    { resource: 'Frontend Team', utilized: 85, available: 15 },
    { resource: 'Backend Team', utilized: 75, available: 25 },
    { resource: 'QA Team', utilized: 90, available: 10 },
  ];

  useEffect(() => {
    // Subscribe to task updates
    const unsubscribe = taskService.subscribe(() => {
      setStats(taskService.getTaskStats());
    });

    return () => unsubscribe();
  }, []);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleExportData = () => {
    // Implementation for exporting data
    const data = {
      stats,
      performanceData,
      workTypeData,
      workloadData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-data.json';
    a.click();
  };

  const handleDateSelect = (date: Date) => {
    const tasks = taskService.getTasksForDate(date);
    setSelectedDateTasks(tasks);
  };

  // Task count cards data
  const taskCounts = [
    { title: 'Total Tasks', count: stats.totalTasks },
    { title: 'Pending Tasks', count: stats.pendingTasks },
    { title: 'Completed Tasks', count: stats.completedTasks },
  ];

  // Data for Pending Tasks by Priority chart
  const pendingTasksByPriority = [
    { name: 'High', tasks: stats.tasksByPriority.high },
    { name: 'Medium', tasks: stats.tasksByPriority.medium },
    { name: 'Low', tasks: stats.tasksByPriority.low },
  ];

  // Data for Task Status Distribution pie chart
  const taskStatusData = [
    { name: 'Pending', value: stats.pendingTasks },
    { name: 'Completed', value: stats.completedTasks },
  ];

  const COLORS = ['#8884d8', '#82ca9d'];

  // Add sprint selection handler
  const handleSprintChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSprint(event.target.value);
    // Here you would typically fetch data for the selected sprint
    // For now we're using mock data
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={handleFilterClick}>
            <FilterIcon />
          </IconButton>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={() => setStats(taskService.getTaskStats())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem>
          <FormControl fullWidth>
            <InputLabel>Team Member</InputLabel>
            <Select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <MenuItem value="all">All Members</MenuItem>
              <MenuItem value="Joe">Joe</MenuItem>
              <MenuItem value="Jabin">Jabin</MenuItem>
              <MenuItem value="Sarah">Sarah</MenuItem>
            </Select>
          </FormControl>
        </MenuItem>
      </Menu>

      {/* Task Count Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {taskCounts.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="h3" component="div">
                {item.count}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Calendar and Task Details Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Calendar
            </Typography>
            <Calendar onDateSelect={handleDateSelect} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tasks for Selected Date
            </Typography>
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                <Paper
                  key={task.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    borderLeft: 6,
                    borderColor: task.priority === 'high' ? 'error.main' : 
                               task.priority === 'medium' ? 'warning.main' : 'success.main',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleTaskClick(task)}
                >
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Priority: {task.priority} | Status: {task.status}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Typography color="text.secondary">
                No tasks for selected date
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Task Details Dialog */}
      <Dialog
        open={showTaskDetails}
        onClose={() => setShowTaskDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTask.title}</Typography>
                <Chip
                  label={selectedTask.status}
                  color={selectedTask.status === 'completed' ? 'success' : 'default'}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedTask.description || 'No description provided'}
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assigned To
                  </Typography>
                  <Typography>{selectedTask.assignedTo || 'Unassigned'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography>
                    {selectedTask.dueDate
                      ? new Date(selectedTask.dueDate).toLocaleDateString()
                      : 'No due date'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedTask.priority}
                    color={
                      selectedTask.priority === 'high'
                        ? 'error'
                        : selectedTask.priority === 'medium'
                        ? 'warning'
                        : 'success'
                    }
                    size="small"
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <TaskComments taskId={selectedTask.id} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTaskDetails(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Pending Tasks by Priority
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pendingTasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Bar dataKey="tasks" fill="#8884d8" name="Number of Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Task Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Graphs */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Individual Performance Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Line type="monotone" dataKey="Joe" stroke="#8884d8" />
                <Line type="monotone" dataKey="Jabin" stroke="#82ca9d" />
                <Line type="monotone" dataKey="Sarah" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Completed Work by Type
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={workTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#4caf50" name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#ff9800" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Workload Distribution by Team Member
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#4caf50"
                  fill="#4caf50"
                  name="Completed Tasks"
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="1"
                  stroke="#ff9800"
                  fill="#ff9800"
                  name="Pending Tasks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* New Deadline Analysis Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Deadline Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deadlineData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {deadlineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#4caf50', '#ff9800', '#f44336'][index]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Team Skills Assessment
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Joe" dataKey="Joe" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Jabin" dataKey="Jabin" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Radar name="Sarah" dataKey="Sarah" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <Legend />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Task Tags Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Popular Task Tags
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label="Frontend" color="primary" />
              <Chip label="Backend" color="secondary" />
              <Chip label="Bug Fix" color="error" />
              <Chip label="Feature" color="success" />
              <Chip label="Documentation" color="info" />
              <Chip label="Testing" color="warning" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Sprint Planning and Analytics Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Sprint Planning" />
                <Tab label="Task Analytics" />
                <Tab label="Resource Management" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ mr: 2 }}>
                        Burndown Chart
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sprint</InputLabel>
                        <Select
                          value={selectedSprint}
                          onChange={(e) => handleSprintChange(e as React.ChangeEvent<HTMLInputElement>)}
                          label="Sprint"
                        >
                          <MenuItem value="Sprint 1">Sprint 1</MenuItem>
                          <MenuItem value="Sprint 2">Sprint 2</MenuItem>
                          <MenuItem value="Sprint 3">Sprint 3</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={sprintData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" label={{ value: 'Sprint Day', position: 'bottom' }} />
                        <YAxis label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Line type="monotone" dataKey="planned" stroke="#8884d8" name="Planned" />
                        <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>
                      Sprint Overview
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SpeedIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Sprint Velocity" 
                          secondary="32 story points/sprint"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TimelineIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Sprint Progress" 
                          secondary={
                            <LinearProgress 
                              variant="determinate" 
                              value={65} 
                              sx={{ mt: 1 }}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <AssessmentIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Sprint Health" 
                          secondary="On Track"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Task Completion Predictions
                    </Typography>
                    <List>
                      {taskPredictions.map((task, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={task.task}
                            secondary={`Completion Probability: ${task.prediction}% | Complexity: ${task.complexity}`}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={task.prediction}
                            sx={{ width: 100, ml: 2 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Task Dependencies
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Area type="monotone" dataKey="Joe" stackId="1" fill="#8884d8" />
                        <Area type="monotone" dataKey="Jabin" stackId="1" fill="#82ca9d" />
                        <Area type="monotone" dataKey="Sarah" stackId="1" fill="#ffc658" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Resource Utilization
                    </Typography>
                    {resourceUtilization.map((resource, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">{resource.resource}</Typography>
                        <LinearProgress
                          variant="buffer"
                          value={resource.utilized}
                          valueBuffer={100}
                          sx={{ height: 10, mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {resource.utilized}% Utilized | {resource.available}% Available
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Team Availability Calendar
                    </Typography>
                    <Calendar onDateSelect={handleDateSelect} />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Task Comments and Discussions Section */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity & Discussions
            </Typography>
            <List>
              {[1, 2, 3].map((item) => (
                <React.Fragment key={item}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Avatar>U{item}</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={`Task Update ${item}`}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            User {item}
                          </Typography>
                          {" — Updated the task status and added comments..."}
                        </>
                      }
                    />
                    <Stack direction="row" spacing={1}>
                      <IconButton size="small">
                        <CommentIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 