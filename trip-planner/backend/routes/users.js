var express = require('express')
var router = express.Router();
var User = require('../models/User');
var auth = require('../util/auth');

// Leftover from NETS...not sure if needed.
const CACHE_PERSISTENCE = 1000*60*10; // 10 mins
var searchCache = {};
const SEARCH_NUM = 2;

router.post('/login', (req, res) => {
    if (req.session.user) {
        return res.json({'msg': 'Already logged in!', 'user': req.session.user});
    }

    var username = req.body.username;

    if (!username) {
        return res.status(401).json({'err': true, 'msg': 'Username cannot be empty.'});
    }

    User.find(username, (err, usr) => {
        if (err) {
            console.log(err);
            if (err == "No such user") {
                return res.status(401).json({'err': true, 'msg': 'No such user found.'});
            }
            return res.status(500).json({'err': true, 'msg': 'There was an internal server error.'});
        }
        var password = auth.hash(req.body.password);
        if (usr.password !== password) {
            return res.status(401).json({'err': true, 'msg': 'Your username/password does not match.'});
        }
        delete usr.password;

        req.session.user = usr;
        req.session.save(() => res.json({'msg': 'Logged in!', 'user': usr}))
    })
})

router.post('/register', (req,res) => {
    var newUser = req.body;
    newUser.password = auth.hash(newUser.password);
    User.create(newUser, (err, usr) => {
      if (err) {
        console.log(err);
        if (err == "User with that username already exists!")
          return res.status(403).json({'err':true, 'msg':'User with that username already exists!'});
        return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
      }
  
      delete usr.password;
  
      req.session.user = usr;
      req.session.save(() => res.json({'msg':'Registered!','user':usr}))
    });
});

router.post('/logout', auth.loggedIn, (req, res) => {
    req.session.user = null;
    req.session.save(() => res.json({'msg':'Logged out!'}))
});

router.get('/getTrips/:user', auth.loggedIn, (req, res) => {
    User.findTrips(req.params.user, (err, usr) => {
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: usr});
    })
})

router.get('/getFriends/:user', auth.loggedIn, (req, res) => {
    User.findFriends(req.params.user, (err, usr) => {
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: usr});
    })
})

router.get('/getFriendRequests/:user', auth.loggedIn, (req, res) => {
    User.findFriendRequests(req.params.user, (err, usr) => {
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: usr});
    })
})

router.post('/friendRequest', (req,res) => {
    var friendExists = false;

    User.findFriends(req.body.user, (err, user) => {
        // Check if you exist
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        } else {
            // Check if requested user exists
            User.findFriends(req.body.requestedUser, (err, requested) => {
                if (err) {
                    console.log(err);
                    if (err == "No such user")
                        return res.status(404).json({'err':true, 'msg':'No such user.'});
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                } else {
                    // Check if user is already a friend
                    for (var i = 0; i < user.friends.L.length; i++) {
                        if (user.friends.L[i].S === req.body.requestedUser) {
                            console.log("User is already a friend!")
                            return res.status(500).json({'err':true, 'msg': 'User is already a friend!'}) 
                        }
                    }

                    // Check if user is already requested
                    for (var i = 0; i < requested.friendRequests.L.length; i++) {
                        if (requested.friendRequests.L[i].S === req.body.user) {
                            console.log("User has already been requested!")
                            return res.status(500).json({'err':true, 'msg': 'User has already been requested!'}) 
                        }
                    }

                    // Add your request to their list
                    var theirRequests = requested.friendRequests.L
                    var theirEntry = {}
                    theirEntry["S"] = req.body.user
                    theirRequests.push(theirEntry)

                    User.updateFriendRequests(req.body.requestedUser, theirRequests, (err, msg) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                        } else {
                            res.send({msg: "success", data: msg});
                        }
                    });
                }
            })
        }
    })
});

router.post('/acceptRequest', (req,res) => {

    User.findFriends(req.body.username, (err, user) => {
        // Check if you exist
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        } else {
            // Check if friend exists
            User.findFriends(req.body.friend, (err, friend) => {
                if (err) {
                    console.log(err);
                    if (err == "No such user")
                        return res.status(404).json({'err':true, 'msg':'No such user.'});
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                } else {
                    // Remove from my friendRequests
                    var myRequests = user.friendRequests.L
                    for (var i = 0; i < user.friendRequests.L.length; i++) {
                        if (user.friendRequests.L[i].S === req.body.friend) {
                            myRequests.splice(i, 1);
                            break;
                        }
                    }
                    // Update friendRequests
                    User.updateFriendRequests(req.body.username, myRequests, (err, msg) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                        } else {
                            // Remove from their friendRequests if I also requested them
                            var theirRequests = friend.friendRequests.L
                            for (var i = 0; i < friend.friendRequests.L.length; i++) {
                                if (friend.friendRequests.L[i].S === req.body.username) {
                                    theirRequests.splice(i, 1);
                                    break;
                                }
                            }
                            User.updateFriendRequests(req.body.friend, theirRequests, (err, msg) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                                } else {
                                    // Update my friends
                                    var myFriends = user.friends.L
                                    var myEntry = {}
                                    myEntry["S"] = req.body.friend
                                    myFriends.push(myEntry)
                                    // Update friend's friends
                                    var theirFriends = friend.friends.L
                                    var theirEntry = {}
                                    theirEntry["S"] = req.body.username
                                    theirFriends.push(theirEntry)
                                    User.updateFriends(req.body.username, myFriends, (err, msg) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                                        } else {
                                            User.updateFriends(req.body.friend, theirFriends, (err, msg) => {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                                                } else {
                                                    res.send({msg: "success", data: msg});
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.post('/removeRequest', (req,res) => {

    User.findFriends(req.body.username, (err, user) => {
        // Check if you exist
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        } else {
            // Check if friend exists
            User.findFriends(req.body.friend, (err, friend) => {
                if (err) {
                    console.log(err);
                    if (err == "No such user")
                        return res.status(404).json({'err':true, 'msg':'No such user.'});
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                } else {
                    // Remove from friendRequests
                    var myRequests = user.friendRequests.L
                    for (var i = 0; i < user.friendRequests.L.length; i++) {
                        if (user.friendRequests.L[i].S === req.body.friend) {
                            myRequests.splice(i, 1);
                            break;
                        }
                    }
                    // Update friendRequests
                    User.updateFriendRequests(req.body.username, myRequests, (err, msg) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                        } else {
                            res.send({msg: "success", data: msg});
                        }
                    });
                }
            });
        }
    });
});

router.post('/unfriend', (req,res) => {

    User.findFriends(req.body.username, (err, user) => {
        // Check if you exist
        if (err) {
            console.log(err);
            if (err == "No such user")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        } else {
            // Check if friend exists
            User.findFriends(req.body.friend, (err, friend) => {
                if (err) {
                    console.log(err);
                    if (err == "No such user")
                        return res.status(404).json({'err':true, 'msg':'No such user.'});
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                } else {
                    // Remove names from each others' friend lists
                    var myFriends = user.friends.L
                    var theirFriends = friend.friends.L
                    for (var i = 0; i < user.friends.L.length; i++) {
                        if (user.friends.L[i].S === req.body.friend) {
                            myFriends.splice(i, 1);
                            break;
                        }
                    }
                    for (var i = 0; i < friend.friends.L.length; i++) {
                        if (friend.friends.L[i].S === req.body.username) {
                            theirFriends.splice(i, 1);
                            break;
                        }
                    }
                    // Update friend lists
                    User.updateFriends(req.body.username, myFriends, (err, msg) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                        } else {
                            User.updateFriends(req.body.friend, theirFriends, (err, msg) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                                } else {
                                    res.send({msg: "success", data: msg});
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // User.getDetails(newTrip.username, (err, user) => {
    //     if (err == "No such user") {
    //         return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
    //     } else {
    //         Trip.find(newTrip.tripId, (err, existingTrip) => {
    //             if (err) {
    //                 return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
    //             } else {
    //                 Trip.destroy(newTrip.tripId, (err, data) => {
    //                     if (err) {
    //                         return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
    //                     }

    //                     var updatedTrips = user.trips.L;
    //                     var index = -1;
    //                     if (updatedTrips.length > 0) {
    //                         for (var i=0; i<updatedTrips.length; i++) {
    //                             if (updatedTrips[i].S === newTrip.tripId) {
    //                                 index = i;
    //                             }
    //                         }
    //                     }
    //                     if (index > -1) {
    //                         updatedTrips.splice(index, 1)
    //                     }

    //                     User.updateTrips(newTrip.username, updatedTrips, (err, updatedUser) => {
    //                         if (err) {
    //                             return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
    //                         }
    //                     })
    //                 });
    //             }
    //         })
    //     }
    // })
});

// router.post('/deleteUser', auth.loggedIn, (req, res) => {
//     User.destroy(req.body.username, (err, usr) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
//         }
//         res.send({msg: "success", data: usr});
//     })
// })

// TODO: Add routes.

module.exports = router;