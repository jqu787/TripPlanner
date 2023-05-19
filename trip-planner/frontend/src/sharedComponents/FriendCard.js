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
  import CheckIcon from '@mui/icons-material/Check';
  import CloseIcon from '@mui/icons-material/Close';
  import React, { useState } from 'react';
  import tempAvatar from '../resources/1.jpg'
  import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

  function FriendCard(props) {
    const [reveal, setReveal] = useState(false);
    const [open, setOpen] = React.useState(false);
  
    const handleClose = () => {
      setOpen(false);
    };

    const handleClickOpen = () => {
      setOpen(true);
    };

    const handleClickDelete = () => {
      unfriend(props.S);
      setOpen(false);
    };

    const handleClickAccept = () => {
      acceptRequest(props.S);
    };

    const handleClickReject = () => {
      removeRequest(props.S);
    };

    const unfriend = async (friend) => {
      const res = await fetch("http://localhost:5000/api/users/unfriend", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'friend': friend, 'username': props.user.username}) 
      });
      
      var newFriends = [];
      for (var i = 0; i < props.friends.length; i++) {
        if (props.friends[i].S != friend) {
          newFriends.push(props.friends[i]);
        }
      }
      props.setFriends(newFriends);
    };
    
    const acceptRequest = async (friend) => {
      const res = await fetch("http://localhost:5000/api/users/acceptRequest", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'friend': friend, 'username': props.user.username}) 
      });
      
      var newFriends = [...props.friends]
      newFriends.push({"S": friend})
      props.setFriends(newFriends)

      var newFriendRequests = [];
      console.log(friend);
      console.log(props.friendRequests);
      for (var i = 0; i < props.friendRequests.length; i++) {
        if (props.friendRequests[i].S != friend) {
          newFriendRequests.push(props.friendRequests[i]);
        }
      }
      props.setFriendRequests(newFriendRequests);
    };

    const removeRequest = async (friend) => {
      const res = await fetch("http://localhost:5000/api/users/removeRequest", {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
          'Access-Control-Allow-Credentials': true
        },
        redirect: 'follow',
        body: JSON.stringify({'friend': friend, 'username': props.user.username}) 
      });

      var newFriendRequests = [];
      for (var i = 0; i < props.friendRequests.length; i++) {
        if (props.friendRequests[i].S != friend) {
          newFriendRequests.push(props.friendRequests[i]);
        }
      }
      props.setFriendRequests(newFriendRequests);
    };

    const renderIcons = () => {
      switch (props.type) {
        case 'friend':
          return (
            <Fade in={reveal}>
              <IconButton color='error' onClick={handleClickOpen}>
                <DeleteOutlineIcon />
              </IconButton>
            </Fade>
          );
        case 'request':
          return (
            <Fade in={reveal}>
              <Stack direction='row' sapcing={2}>
                <IconButton color='primary' onClick={handleClickAccept}>
                  <CheckIcon />
                </IconButton>
                <IconButton color='error' onClick={handleClickReject}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </Fade>
          );
        default:
          return null;
      }
    };

    return (
      <div>
        <Card
          sx={{
            border: 1,
            borderColor: '#CFD9DC',
            borderRadius: '5px',
            height: '75px',
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
              flexDirection: 'row',
            }}>
              <Avatar src={tempAvatar} />
              <Typography fontWeight={500} sx={{ fontSize: '14pt', mt: '7px', ml: '15px' }}>{props.S}</Typography>
            </Box>
            { reveal && renderIcons() }
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
              {"Are you sure you want to delete " + props.S + " as a friend?"}
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleClose}>CANCEL</Button>
              <Button onClick={handleClickDelete} autoFocus sx={{ fontWeight: 700, color: '#DB4437' }}>
                DELETE FRIEND
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </div>
    );
  }

  export default FriendCard;