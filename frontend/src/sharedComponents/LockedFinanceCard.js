import { 
    Box,
    Card,
    Stack,
    Typography, 
    Button,
    CardContent,
  } from '@mui/material';
  import CircleIcon from '@mui/icons-material/Circle';
  import { useNavigate } from 'react-router-dom';

  function LockedFinanceCard(props) {

    const navigate = useNavigate();

    const navExpenseReport = () => {
      navigate(`/expenses/${props.tripId}`);
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
            <Button variant="text" onClick={navExpenseReport} sx={{ fontWeight: 500, color: '#1DB11D', mt: '8px' }}>EXPENSE REPORT</Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  export default LockedFinanceCard;