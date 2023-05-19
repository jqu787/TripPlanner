import { 
    Box,
    Card,
    Stack,
    Typography, 
    CardActionArea,
    CardContent,
  } from '@mui/material';
  import CircleIcon from '@mui/icons-material/Circle';
  import { useNavigate } from 'react-router-dom';

  function PhotoCard(props) {

    const getRemainingDays = (startDate) => {
      const d1 = new Date(Date.parse(startDate));
      const d2 = new Date();
      const diff = d1.getTime() - d2.getTime();
      return Math.ceil(diff / (1000 * 3600 *24));
    }

    const navigate = useNavigate();

    const navTrip = () => {
      navigate(`/photos/${props.id}`);
    }

    const renderPhotoCard = () => {
      switch (props.type) {
        case 'ongoing':
          return (
            <Card
              sx={{
                border: 1,
                borderColor: '#CFD9DC',
                borderRadius: '5px',
              }} 
            >
              <CardActionArea onAnimationEnd={navTrip}>
                <CardContent>
                  <Box sx={{
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography fontWeight={500}>{props.name}</Typography>
                      <Typography variant='body2'>{`${props.startDate} - ${props.endDate}`}</Typography>
                      <Typography variant='body2'>{props.location}</Typography>
                    </Stack>
                    <CircleIcon sx={{width: '10px', height: '10px', color: '#1DB11D'}} />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        case 'upcoming':
          return (
            <Card
              sx={{
                border: 1,
                borderColor: '#CFD9DC',
                borderRadius: '5px',
              }} 
            >
              <CardActionArea onAnimationEnd={navTrip}>
                <CardContent>
                <Box sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  }}
                >
                    <Stack spacing={0.5}>
                      <Typography fontWeight={500}>{props.name}</Typography>
                      <Typography variant='body2'>{`${props.startDate} - ${props.endDate}`}</Typography>
                      <Typography variant='body2'>{props.location}</Typography>
                    </Stack>
                    <Typography color='#395EE2' variant='body2'>{`In ${getRemainingDays(props.startDate)} days`}</Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        case 'completed':
          return (
            <Card
              sx={{
                border: 1,
                borderColor: '#CFD9DC',
                borderRadius: '5px',
              }} 
            >
              <CardActionArea onAnimationEnd={navTrip}>
                <CardContent>
                <Box sx={{
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  }}
                >
                    <Stack spacing={0.5}>
                      <Typography fontWeight={500}>{props.name}</Typography>
                      <Typography variant='body2'>{`${props.startDate} - ${props.endDate}`}</Typography>
                      <Typography variant='body2'>{props.location}</Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        default:
          return null
      }
    };

    return (
      renderPhotoCard()
    );
  }

  export default PhotoCard;