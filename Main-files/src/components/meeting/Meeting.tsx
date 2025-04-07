import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Divider,
  Stack,
  Tooltip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  VideoCall as VideoCallIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
} from '@mui/icons-material';

declare global {
  interface Window {
    faceapi: any;
  }
}

interface MeetingData {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  participants: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface ParticipantMetrics {
  id: string;
  name: string;
  attentionScore: number;
  focusTime: number;
  distractions: number;
}

const initialMeetings: MeetingData[] = [
  {
    id: 1,
    title: 'Sample',
    description: 'Meeting Scheduled',
    date: '2025-04-06',
    time: '10:00',
    duration: 60,
    participants: ['Sample', 'Joe'],
    status: 'scheduled',
  },
  {
    id: 2,
    title: 'Jabin',
    description: 'Meeting Scheduled',
    date: '2025-04-06',
    time: '14:00',
    duration: 30,
    participants: ['Jabin', 'Joe'],
    status: 'scheduled',
  },
];

const Meeting: React.FC = () => {
  const [meetings, setMeetings] = useState<MeetingData[]>(initialMeetings);
  const [open, setOpen] = useState(false);
  const [editMeeting, setEditMeeting] = useState<MeetingData | null>(null);
  const [newMeeting, setNewMeeting] = useState<Partial<MeetingData>>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
    participants: [],
    status: 'scheduled',
  });
  const [participant, setParticipant] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantMetrics, setParticipantMetrics] = useState<ParticipantMetrics[]>([
    { id: '1', name: 'You', attentionScore: 100, focusTime: 0, distractions: 0 },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeness, setActiveness] = useState<number>(100);
  const activenessCheckInterval = useRef<NodeJS.Timeout>();
  const lastActivityTime = useRef(Date.now());
  const faceapiRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const initializeStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: isAudioOn 
        });
        
        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsVideoOn(true);

        // Configure initial audio state
        const audioTrack = mediaStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = isAudioOn;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsVideoOn(false);
      }
    };

    initializeStream();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAudioOn]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMeeting(null);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      participants: [],
      status: 'scheduled',
    });
  };

  const handleSave = () => {
    if (editMeeting) {
      setMeetings(
        meetings.map((meeting) =>
          meeting.id === editMeeting.id ? { ...meeting, ...newMeeting } : meeting
        )
      );
    } else {
      setMeetings([...meetings, { ...newMeeting, id: meetings.length + 1 } as MeetingData]);
    }
    handleClose();
  };

  const handleEdit = (meeting: MeetingData) => {
    setEditMeeting(meeting);
    setNewMeeting(meeting);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setMeetings(meetings.filter((meeting) => meeting.id !== id));
  };

  const handleAddParticipant = () => {
    if (participant && !newMeeting.participants?.includes(participant)) {
      setNewMeeting({
        ...newMeeting,
        participants: [...(newMeeting.participants || []), participant],
      });
      setParticipant('');
    }
  };

  const handleRemoveParticipant = (participantToRemove: string) => {
    setNewMeeting({
      ...newMeeting,
      participants: newMeeting.participants?.filter((p) => p !== participantToRemove),
    });
  };

  const handleJoinMeeting = (meeting: MeetingData) => {
    // Update participant metrics when joining a meeting
    const newParticipants: ParticipantMetrics[] = [
      { id: '1', name: 'You', attentionScore: 100, focusTime: 0, distractions: 0 },
      ...meeting.participants.map((name, index) => ({
        id: (index + 2).toString(),
        name,
        attentionScore: 100,
        focusTime: 0,
        distractions: 0,
      })),
    ];
    setParticipantMetrics(newParticipants);
    console.log('Joining meeting:', meeting.title);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const getAttentionColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 50) return 'warning.main';
    return 'error.main';
  };

  useEffect(() => {
    const fetchActiveness = () => {
      fetch('http://localhost:5001/activeness')
        .then((res) => res.json())
        .then((data) => {
          setActiveness(data.activeness);
          // Update participant metrics with the new activeness score
          setParticipantMetrics(prevMetrics =>
            prevMetrics.map(participant => {
              if (participant.id === '1') { // Current user
                const timeSinceLastUpdate = Date.now() - lastActivityTime.current;
                return {
                  ...participant,
                  attentionScore: data.activeness,
                  focusTime: participant.focusTime + (data.activeness >= 50 ? timeSinceLastUpdate : 0),
                  distractions: data.activeness < 50 ? participant.distractions + 1 : participant.distractions
                };
              }
              return participant;
            })
          );
          lastActivityTime.current = Date.now();
        })
        .catch((err) => {
          console.error('Error fetching activeness:', err);
          setError('Failed to connect to eye tracking server. Please ensure the server is running.');
        });
    };

    // Start polling the activeness endpoint
    activenessCheckInterval.current = setInterval(fetchActiveness, 2000);

    // Initial fetch
    fetchActiveness();

    return () => {
      if (activenessCheckInterval.current) {
        clearInterval(activenessCheckInterval.current);
      }
    };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Main Meeting Area */}
        <Grid item xs={12} md={9}>
          <Paper 
            sx={{ 
              height: '75vh',
              bgcolor: 'grey.900',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                
                {error && (
                  <Alert 
                    severity="error"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      right: 16,
                      zIndex: 1000
                    }}
                  >
                    {error}
                  </Alert>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Meeting Controls */}
          <Paper sx={{ mt: 2, p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Tooltip title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}>
                <IconButton 
                  onClick={toggleVideo} 
                  color={isVideoOn ? 'primary' : 'error'}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}>
                <IconButton 
                  onClick={toggleAudio} 
                  color={isAudioOn ? 'primary' : 'error'}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  {isAudioOn ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                <IconButton 
                  onClick={toggleScreenShare} 
                  color={isScreenSharing ? 'primary' : 'inherit'}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                color="error"
                sx={{ px: 4 }}
              >
                End Meeting
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Attention Tracking Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '75vh', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Participants Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {participantMetrics.map((participant) => (
              <Box key={participant.id} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{participant.name}</Typography>
                  <Typography 
                    variant="body2"
                    sx={{ color: getAttentionColor(participant.attentionScore) }}
                  >
                    {participant.attentionScore}% Active
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={participant.attentionScore}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'grey.200',
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getAttentionColor(participant.attentionScore),
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Distractions: {participant.distractions}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Meetings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          Schedule Meeting
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <List>
          {meetings.map((meeting) => (
            <ListItem key={meeting.id}>
              <ListItemText
                primary={meeting.title}
                secondary={
                  <>
                    {meeting.description}
                    <br />
                    Date: {meeting.date} Time: {meeting.time}
                    <br />
                    Duration: {meeting.duration} minutes
                    <br />
                    Participants: {meeting.participants.join(', ')}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleJoinMeeting(meeting)}>
                  <VideoCallIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleEdit(meeting)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(meeting.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newMeeting.title}
            onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newMeeting.description}
            onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            value={newMeeting.date}
            onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            label="Time"
            type="time"
            fullWidth
            value={newMeeting.time}
            onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Duration (minutes)</InputLabel>
            <Select
              value={newMeeting.duration}
              label="Duration (minutes)"
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, duration: e.target.value as number })
              }
            >
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={30}>30</MenuItem>
              <MenuItem value={45}>45</MenuItem>
              <MenuItem value={60}>60</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Participants</Typography>
            <Box display="flex" gap={1} mb={1}>
              {newMeeting.participants?.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  onDelete={() => handleRemoveParticipant(p)}
                />
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                label="Add Participant"
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
              />
              <Button onClick={handleAddParticipant}>Add</Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editMeeting ? 'Save Changes' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Meeting; 