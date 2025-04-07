import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemButton,
  Divider,
  Fab,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatData {
  id: number;
  name: string;
  type: 'private' | 'group';
  participants: string[];
  messages: Message[];
  lastMessage?: string;
}

const MOCK_USERS = [
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Williams',
  'David Brown',
];

const Chat: React.FC = () => {
  const [chats, setChats] = useState<ChatData[]>([
    {
      id: 1,
      name: 'Team General',
      type: 'group',
      participants: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      messages: [],
      lastMessage: 'Last message in general chat',
    },
  ]);
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [openNewChat, setOpenNewChat] = useState(false);
  const [chatType, setChatType] = useState<'private' | 'group'>('private');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatName, setChatName] = useState('');

  const handleNewMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message: Message = {
        id: Date.now(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
      };

      setChats(chats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, messages: [...chat.messages, message], lastMessage: newMessage }
          : chat
      ));
      setNewMessage('');
    }
  };

  const handleCreateChat = () => {
    if ((chatType === 'private' && selectedUsers.length === 1) || 
        (chatType === 'group' && selectedUsers.length > 1 && chatName)) {
      const newChat: ChatData = {
        id: Date.now(),
        name: chatType === 'private' ? selectedUsers[0] : chatName,
        type: chatType,
        participants: [...selectedUsers],
        messages: [],
      };

      setChats([...chats, newChat]);
      setOpenNewChat(false);
      resetNewChatForm();
    }
  };

  const resetNewChatForm = () => {
    setChatType('private');
    setSelectedUsers([]);
    setChatName('');
  };

  const handleUserSelect = (user: string) => {
    if (chatType === 'private') {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers(prev => 
        prev.includes(user) 
          ? prev.filter(u => u !== user)
          : [...prev, user]
      );
    }
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex' }}>
      {/* Chat List */}
      <Paper sx={{ width: 320, mr: 2, position: 'relative' }}>
        <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
          Chats
        </Typography>
        <Divider />
        <List sx={{ overflow: 'auto', height: 'calc(100% - 130px)' }}>
          {chats.map((chat) => (
            <ListItemButton
              key={chat.id}
              selected={selectedChat?.id === chat.id}
              onClick={() => setSelectedChat(chat)}
            >
              <ListItemAvatar>
                <Avatar>
                  {chat.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={chat.name}
                secondary={chat.lastMessage}
                primaryTypographyProps={{
                  variant: 'subtitle1',
                  fontWeight: selectedChat?.id === chat.id ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
          <Fab color="primary" onClick={() => setOpenNewChat(true)}>
            <AddIcon />
          </Fab>
        </Box>
      </Paper>

      {/* Chat Messages */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedChat ? (
          <>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                {selectedChat.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                {selectedChat.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedChat.type === 'group' 
                  ? `${selectedChat.participants.length} participants`
                  : 'Private chat'}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              {selectedChat.messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'You' ? 'row-reverse' : 'row',
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      px: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === 'You' ? 'primary.main' : 'grey.100',
                      color: message.sender === 'You' ? 'white' : 'inherit',
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNewMessage()}
              />
              <IconButton color="primary" onClick={handleNewMessage}>
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        )}
      </Paper>

      {/* New Chat Dialog */}
      <Dialog open={openNewChat} onClose={() => {
        setOpenNewChat(false);
        resetNewChatForm();
      }}>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Chat Type</InputLabel>
            <Select
              value={chatType}
              label="Chat Type"
              onChange={(e) => {
                setChatType(e.target.value as 'private' | 'group');
                setSelectedUsers([]);
              }}
            >
              <MenuItem value="private">Private Chat</MenuItem>
              <MenuItem value="group">Group Chat</MenuItem>
            </Select>
          </FormControl>

          {chatType === 'group' && (
            <TextField
              fullWidth
              label="Group Name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Typography variant="subtitle1" gutterBottom>
            Select {chatType === 'private' ? 'user' : 'users'}:
          </Typography>
          <List>
            {MOCK_USERS.map((user) => (
              <ListItem
                key={user}
                dense
                onClick={() => handleUserSelect(user)}
                sx={{ cursor: 'pointer' }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedUsers.includes(user)}
                  disabled={chatType === 'private' && selectedUsers.length === 1 && !selectedUsers.includes(user)}
                />
                <ListItemText primary={user} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenNewChat(false);
            resetNewChatForm();
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateChat}
            disabled={
              (chatType === 'private' && selectedUsers.length !== 1) ||
              (chatType === 'group' && (selectedUsers.length < 2 || !chatName))
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat; 