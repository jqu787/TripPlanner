const multer = require('multer')
const sharp = require('sharp')
const crypto =require ('crypto')

const { PrismaClient }= require('@prisma/client')
const { uploadFile, deleteFile, getObjectSignedUrl } = require('./s3.js')

const prisma = new PrismaClient()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

var Trip = require('./models/Trip');

const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const port = 5000;
const server = require('http').createServer(app);
const { Server } = require('socket.io');
//@ts-ignore
const io = require('socket.io')(server);
app.set('socketio', io);
const cors = require('cors');

const whitelist = ['http://localhost:3000'];
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
      if(whitelist.includes(origin))
        return callback(null, true)
  
        callback(new Error('Not allowed by CORS'));
    }
}

app.use(cors(corsOptions))

// Welcome on connection
io.on('connection', function(socket) {
    console.log("New client connected.");
    socket.emit('connection', null);
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true, 
    cookie: {
        secure: false,
        maxAge: 24*60*60*1000 // 1 day
    }
}))

const users = require('./routes/users');
const trips = require('./routes/trips');
const events = require('./routes/events');
const images = require('./routes/images');

// add routes here

app.use(bodyParser.json());

app.use('/api/users', users);
app.use('/api/trips', trips);
app.use('/api/events', events);
app.use('/api/posts', images);

// add routes here

app.use('/', express.static('build'))

app.get('/hello', (req, res) => {
    console.log('a request!')
    res.send({data: 'Hello World!'})
})

//s3

app.get("/api/posts", async (req, res) => {
  Trip.getDetails(req.query.tripId, async (err, trip) => {
    if (err) {
      res.send(null)
    } else {
      var photos = [...trip.photos.L]
      var newPhotos = []
      for (var i = 0; i < photos.length; i++) {
        newPhotos.push(photos[i].S)
      }
      const posts = await prisma.posts.findMany({where: {imageName: {in: newPhotos}}, orderBy: [{ created: 'desc'}]})
      for (let post of posts) {
        post.imageUrl = await getObjectSignedUrl(post.imageName)
      }
      res.send(posts)
    }
  })
})

const uploadHelper = async (tripId, imageName) => {
  Trip.getDetails(tripId, (err, trip) => {
    if (err) {
      return 'There was an internal server error. Try again.'
    } else {
      var newPhotos = [...trip.photos.L]
      newPhotos.push({"S": imageName})
      Trip.updatePhotos(tripId, newPhotos, (err, trip) => {
        if (err) {
          return 'There was an internal server error. Try again.'
        }
      })
    }
  })
}
  
  
app.post('/api/posts', upload.single('image'), async (req, res) => {
    const file = req.file
    const caption = req.body.caption
    const imageName = generateFileName()

    uploadHelper(req.body.tripId, imageName)

    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer()
  
    await uploadFile(fileBuffer, imageName, file.mimetype)
  
    const post = await prisma.posts.create({
      data: {
        imageName,
        caption,
      }
    })
    
    res.status(201).send(post)
  })

const deleteHelper = async (tripId, imageName) => {
  Trip.getDetails(tripId, (err, trip) => {
    if (err) {
      return 'There was an internal server error. Try again.'
    } else {
      var oldPhotos = [...trip.photos.L]
      var newPhotos = []
      for (var i = 0 ; i < oldPhotos.length; i++) {
        if (oldPhotos[i].S === imageName) {
          continue
        }
        newPhotos.push(oldPhotos[i])
      }
      Trip.updatePhotos(tripId, newPhotos, (err, trip) => {
        if (err) {
          return 'There was an internal server error. Try again.'
        }
      })
    }
  })
}
  
app.delete("/api/posts/:id", async (req, res) => {
    const id = +req.params.id
    const post = await prisma.posts.findUnique({where: {id}}) 

    deleteHelper(req.body.tripId, post.imageName)
  
    await deleteFile(post.imageName)
  
    await prisma.posts.delete({where: {id: post.id}})
    res.send(post)
  })
  
server.listen(port, function() {
    console.log(`listening on *${port}`);
});


module.exports = app;