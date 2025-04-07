import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { notificationService } from '../../services/notificationService';

interface FileUploadProps {
  onFileUpload: (urls: string[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxFiles = 5,
  acceptedTypes = '*',
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (files.length + selectedFiles.length <= maxFiles) {
      setFiles([...files, ...selectedFiles]);
      setProgress([...progress, ...selectedFiles.map(() => 0)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newProgress = progress.filter((_, i) => i !== index);
    setFiles(newFiles);
    setProgress(newProgress);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          setProgress(prev => {
            const newProgress = [...prev];
            newProgress[index] = i;
            return newProgress;
          });
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        return await notificationService.uploadAttachment(file);
      });

      const urls = await Promise.all(uploadPromises);
      onFileUpload(urls);
      setFiles([]);
      setProgress([]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <input
        type="file"
        multiple
        accept={acceptedTypes}
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= maxFiles}
        >
          Select Files
        </Button>
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
          Max {maxFiles} files
        </Typography>
      </Box>

      {files.length > 0 && (
        <>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
                {progress[index] > 0 && progress[index] < 100 && (
                  <Box sx={{ width: '50%', mr: 2 }}>
                    <LinearProgress variant="determinate" value={progress[index]} />
                  </Box>
                )}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadIcon />}
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            sx={{ mt: 2 }}
          >
            Upload Files
          </Button>
        </>
      )}
    </Box>
  );
};

export default FileUpload; 