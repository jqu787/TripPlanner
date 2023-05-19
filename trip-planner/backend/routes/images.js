var express = require('express')
var router = express.Router();
var User = require('../models/User');
var auth = require('../util/auth');
const multer = require('multer')
const sharp = require('sharp')
const crypto =require ('crypto')

const { PrismaClient }= require('@prisma/client')
const { uploadFile, deleteFile, getObjectSignedUrl } = require('../s3.js')

const prisma = new PrismaClient()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// Leftover from NETS...not sure if needed.
const CACHE_PERSISTENCE = 1000*60*10; // 10 mins
var searchCache = {};
const SEARCH_NUM = 2;
router.get("/api/posts", async (req, res) => {
    // console.log("REACHED HERE PLEASE GET API/POSTS")
    const posts = await prisma.posts.findMany({orderBy: [{ created: 'desc'}]})
    for (let post of posts) {
      post.imageUrl = await getObjectSignedUrl(post.imageName)
    }
    res.send(posts)
  })
  
  
router.post('/api/posts', upload.single('image'), async (req, res) => {
    console.log("REACHED HERE PLEASE POST API/POSTS/")
    const file = req.file
    const caption = req.body.caption
    const imageName = generateFileName()

  
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
  
router.delete("/api/posts/:id", async (req, res) => {
    const id = +req.params.id
    const post = await prisma.posts.findUnique({where: {id}}) 
  
    await deleteFile(post.imageName)
  
    await prisma.posts.delete({where: {id: post.id}})
    res.send(post)
  })
module.exports = router;