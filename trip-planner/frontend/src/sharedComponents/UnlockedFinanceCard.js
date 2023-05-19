import { 
    Box,
    Card,
    Stack,
    Typography,
    CardContent,
    Button,
  } from '@mui/material';
  import { useNavigate } from 'react-router-dom';

  function UnlockedFinanceCard(props) {

    const navigate = useNavigate();

    const navReviewExpenses = () => {
      navigate(`/events/${props.tripId}`);
    }

    return (
      <Card
          sx={{
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
          }} 
      >
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
              <Button variant="text" onClick={navReviewExpenses} sx={{ fontWeight: 500, color: '#395EE2', mt: '8px' }}>REVIEW EXPENSES</Button>
            </Box>
        </CardContent>
      </Card>
    );
  }

  export default UnlockedFinanceCard;