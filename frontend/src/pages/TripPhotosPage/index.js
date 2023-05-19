import { 
  Box,
  Card,
  Grid,
  Container,
  Collapse,
  Fab,
  Skeleton,
  Stack,
  CardActions,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  CssBaseline, 
  FormControl, 
  Typography, 
  Divider,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CardActionArea,
  CardContent,
  Icon,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import AddIcon from '@mui/icons-material/Add';
import { Puff } from 'react-loading-icons';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { sortBy } from 'lodash';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { theme, drawerWidth, headerHeight, gridOffset, margin } from '../../constants';
import Header from '../../sharedComponents/Header';
import Navbar from '../../sharedComponents/Navbar';
import TripCard from '../../sharedComponents/TripCard';
import Loading from '../../sharedComponents/Loading';
import TripPhotoCard from '../../sharedComponents/TripPhotoCard';
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';


function PhotosPage(props) {  
  const drawerWidth = 200;
  const errorMessage = "error";
  const { tripId } = useParams();
  const [caption, setCaption] = useState("")
  const [posts, setPosts] = useState([])
  const [file, setFile] = useState();
  const [error, setError] = useState("");

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get("http://localhost:5000/api/posts", {
        withCredentials: true,
        credentials: 'include',
        baseURL: 'mysql://admin:password@database-1.chzyip9nfkkn.us-east-1.rds.amazonaws.com:3306/Images',
        params: { tripId: tripId }
      })
      setPosts(response.data)
    }
    fetchPosts()
  }, [])
  
  const submit = async event => {
    event.preventDefault()

    if (!file) {
      setError("No File Selected")
      return;
    }

    const formData = new FormData();
    formData.append("image", file)
    formData.append("caption", caption)
    formData.append("tripId", tripId)
    const response = await axios.post("http://localhost:5000/api/posts", formData, { 
      headers: {'Content-Type': 'multipart/form-data'},
      withCredentials: true,
      credentials: 'include',
    })
    // console.log(response)
    window.location.reload();
  }

  const fileSelected = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError("");
  };


  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <CssBaseline />
      <Header text={'Photos'} type='photos' />
      <Container
        disableGutters
        maxWidth={false}
        sx={{ 
          mt: `${headerHeight}px`,
          ml: `${drawerWidth}px`,
          pt: `${margin}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container
          disableGutters
          maxWidth={false}
          sx={{ 
            maxWidth: '1200px',
            position: 'relative',
            height: `calc(100vh - ${headerHeight + margin}px)`,
          }}
        >
          <Container disableGutters sx={{px: `${margin}px`}}>
            <Typography variant="h1">Upload Photos Here</Typography>
            <form style={{ display: 'flex', flexDirection: 'column', paddingTop:'20px' }} onSubmit={submit}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
              >
                <Button onChange={fileSelected} style={{ width: '140px' }} component="label" color="primary" variant="contained">
                  {file ? <Typography variant="p" noWrap >{file.name}</Typography> : <Typography variant="p" noWrap >Upload File</Typography>} <input type="file" accept="image/*" hidden />
                </Button>
                <Box style={{width: '100%', paddingLeft: '20px' }}>
                  <TextField value={caption} onChange={e => setCaption(e.target.value)} style={{ width: '100%', paddingRight: '20px' }} name="caption" label="Caption" />
                </ Box>
                <Button style={{ width: '140px' }} type="submit" color="primary" variant="contained">
                  Submit
                </Button>
              </Box>
            </form>
            {(error === "") ? <></> : <Typography variant="p" style={{color: "red"}}>{error}</Typography>}
            <Divider sx={{ py: '10px' }} />
            <Typography sx={{ mt: '30px' }} variant="h1">Trip Photos</Typography>
            <Container
              disableGutters
              sx={{
                mt: '20px',
                pl: `calc(${margin}px - 16px)`,
                pr: `${margin}px`,
              }}
            >
              <Scrollbars 
                style={{ 
                  width: 'inherit', 
                  height: posts.length > 0
                    ? `calc(100vh - ${headerHeight + 2*margin + 192.5}px)`
                    : `calc(100vh - ${headerHeight + 2*margin + 192.5}px)`,
                }}
              >
                <Grid
                  container 
                  direction='row'
                  spacing={2}
                  sx={{ 
                    ml: 0,
                    pr: '0.5px',
                    width: 'inherit',
                  }}
                >
                  {posts.map(post => (
                    <Grid key={post.id} item xs={2}>
                      <TripPhotoCard
                        id={post.id}
                        imageUrl={post.imageUrl}
                        caption={post.caption}
                        tripId={tripId} />
                    </Grid>
                  ))}
                </Grid>
              </Scrollbars>
            </Container>
          </Container>
        </Container>
      </Container>
    </ThemeProvider>
  )
}

export default PhotosPage;