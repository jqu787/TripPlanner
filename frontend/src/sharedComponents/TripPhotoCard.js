import { 
  Box,
  Card,
  IconButton,
  Typography, 
  Avatar,
  CardContent,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Button,
  Fade,
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';
import tempAvatar from '../resources/1.jpg'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axios from 'axios'

function TripPhotoCard(props) {
  const [reveal, setReveal] = useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickDelete = () => {
    deleteImage(props.id);
    setOpen(false);
  };

  const handleClickDownload = (event) => {
    event.preventDefault();
    const link = document.createElement('a');
    link.download = props.caption;
    link.href = props.imageUrl;
    link.click();
  };

  const handleClickRemove = () => {
    setOpen(true);
  };

  const deleteImage = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        withCredentials: true,
        credentials: 'include',
        data: {
          tripId: props.tripId
        }
      }).then(() => window.location.reload());
    } catch (error) {
      console.log(error);
    }
  }

  const renderIcons = () => {
    return (
      <Fade in={reveal}>
        <Stack direction='row' spacing={2}>
          <IconButton color='primary' onClick={handleClickDownload}>
            <DownloadIcon />
          </IconButton>
          <IconButton color='error' onClick={handleClickRemove}>
            <DeleteOutlineIcon />
          </IconButton>
        </Stack>
      </Fade>
    );
  };

  return (
    <div>
      <Card
        sx={{
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
          height: '100%',
        }} 
        onMouseEnter={() => setReveal(true)}
        onMouseLeave={() => setReveal(false)}
      >
        <CardContent>
          <Box sx={{
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <img src={props.imageUrl} alt={props.caption} style={{width: "85%"}} />
              <Typography fontWeight={500} sx={{ fontSize: '10pt', mt: '10px', mb: '12px', textAlign: "center" }}>{props.caption ? props.caption : "[no caption]"}</Typography>
              { renderIcons() }
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box
          sx={{
            p: '15px',
          }}
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to delete this photo?"}
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleClose}>CANCEL</Button>
            <Button onClick={handleClickDelete} autoFocus sx={{ fontWeight: 700, color: '#DB4437' }}>
              DELETE PHOTO
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </div>
  );
}

export default TripPhotoCard;