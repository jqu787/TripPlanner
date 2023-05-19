import { 
  Grid,
  Container,
  TextField,
  Typography,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function EventForm(props) {
    return (
      <Container
        sx={{
          pt: 1,
          pb: 3,
          border: 1,
          borderColor: '#CFD9DC',
          borderRadius: '5px',
        }} 
      >
        <Grid container spacing={2} columns={24} alignItems='center'>
          <Grid item xs={24}>
            <Stack 
              direction='row' 
              spacing={2}
              display='flex'
              alignItems='center'
            >
              <TextField
                fullWidth
                name='eventName'
                label='Activity'
                variant='standard'
                value={props.events[props.index].name}
                onChange={(e) => props.handleEventChange(e, props.index, 'name')}
              />
              <IconButton 
                color='primary' 
                sx={{height: '32px'}}
                disabled={props.index === 0 && props.events.length === 1}
                onClick={(e) => props.handleDeleteEvent(e, props.index)}
              >
                <CloseIcon sx={{width: '16px', height: '16px'}} />
              </IconButton>
            </Stack>
          </Grid>
          <Grid item xs={24} sm={4.67}>
            <TextField
              fullWidth
              name='eventStartDate'
              label='Start Date'
              variant='filled'
              size='small'
              value={props.events[props.index].startDate}
              onChange={(e) => props.handleEventChange(e, props.index, 'startDate')}
            />
          </Grid>
          <Grid item xs={24} sm={3.5}>
            <TextField
              fullWidth
              name='eventStartTime'
              label='Start Time'
              variant='filled'
              size='small'
              value={props.events[props.index].startTime}
              onChange={(e) => props.handleEventChange(e, props.index, 'startTime')}
            />
          </Grid>
          <Grid item xs={24} sm={1} textAlign='center'>
            <Typography>to</Typography>
          </Grid>
          <Grid item xs={24} sm={4.67}>
            <TextField
              fullWidth
              name='eventEndDate'
              label='End Date'
              variant='filled'
              size='small'
              value={props.events[props.index].endDate}
              onChange={(e) => props.handleEventChange(e, props.index, 'endDate')}
            />
          </Grid>
          <Grid item xs={24} sm={3.5}>
            <TextField
              fullWidth
              name='eventEndTime'
              label='End Time'
              variant='filled'
              size='small'
              value={props.events[props.index].endTime}
              onChange={(e) => props.handleEventChange(e, props.index, 'endTime')}
            />
          </Grid>
          <Grid item xs={24}>
            <TextField
              fullWidth
              name='eventDestinationCity'
              label='Location'
              variant='filled'
              size='small'
              value={props.events[props.index].eventCity}
              onChange={(e) => props.handleEventChange(e, props.index, 'eventCity')}
            />
          </Grid>
          <Grid item xs={24} sm={8.17}>
            <TextField
              fullWidth
              name='cost'
              label='Cost'
              variant='filled'
              size='small'
              value={props.events[props.index].cost}
              onChange={(e) => props.handleEventChange(e, props.index, 'cost')}
            />
          </Grid>
          <Grid item xs={24}>
            <TextField
              fullWidth
              name='eventDescription'
              label='Description'
              variant='filled'
              size='small'
              multiline={true}
              rows={4}
              value={props.events[props.index].description}
              onChange={(e) => props.handleEventChange(e, props.index, 'description')}
            />
          </Grid>
        </Grid>
      </Container>  
    );
  }

export default EventForm;