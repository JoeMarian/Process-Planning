import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Divider,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Comment as CommentIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { TaskComment } from '../../types/sprint';
import { sprintService } from '../../services/sprintService';
import { notificationService } from '../../services/notificationService';
import FileUpload from '../common/FileUpload';

interface TaskCommentsProps {
  taskId: number;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    // Load comments for the task
    const loadComments = () => {
      const taskComments = sprintService.getTaskComments(taskId);
      setComments(taskComments);
    };

    loadComments();
    const unsubscribe = sprintService.subscribe(loadComments);
    return () => unsubscribe();
  }, [taskId]);

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setNewComment(text);

    // Extract mentioned users from the comment
    const mentions = text.match(/@(\w+)/g) || [];
    setMentionedUsers(mentions.map(mention => mention.substring(1)));
  };

  const handleFileUpload = (urls: string[]) => {
    setAttachments([...attachments, ...urls]);
    setShowUploadDialog(false);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() && attachments.length === 0) return;

    const comment: Omit<TaskComment, 'id'> = {
      taskId,
      userId: 'user1', // In a real app, this would be the current user's ID
      content: newComment,
      timestamp: new Date(),
      attachments: attachments.map(url => ({
        name: url.split('/').pop() || '',
        url,
        type: 'file',
      })),
      mentions: mentionedUsers,
    };

    const addedComment = sprintService.addComment(comment);
    await notificationService.notifyNewComment(addedComment);

    setNewComment('');
    setMentionedUsers([]);
    setAttachments([]);
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Box>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <Avatar>{comment.userId[0].toUpperCase()}</Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography component="span" variant="subtitle2">
                        {comment.userId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(comment.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', my: 1 }}
                      >
                        {comment.content}
                      </Typography>
                      {comment.attachments.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {comment.attachments.map((attachment, i) => (
                            <Chip
                              key={i}
                              icon={<LinkIcon />}
                              label={attachment.name}
                              variant="outlined"
                              size="small"
                              component="a"
                              href={attachment.url}
                              target="_blank"
                              clickable
                            />
                          ))}
                        </Stack>
                      )}
                      {comment.mentions.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          {comment.mentions.map((mention, i) => (
                            <Chip
                              key={i}
                              label={`@${mention}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < comments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Write a comment... Use @ to mention users"
            value={newComment}
            onChange={handleCommentChange}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmitComment}
              disabled={!newComment.trim() && attachments.length === 0}
            >
              Send
            </Button>
            <IconButton onClick={() => setShowUploadDialog(true)}>
              <AttachFileIcon />
            </IconButton>
            {attachments.length > 0 && (
              <Typography variant="caption">
                {attachments.length} file(s) attached
              </Typography>
            )}
          </Stack>
        </Box>

        <Dialog
          open={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Upload Files</DialogTitle>
          <DialogContent>
            <FileUpload onFileUpload={handleFileUpload} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default TaskComments; 