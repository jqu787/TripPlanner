var express = require('express')
var tripRoutes = express.Router();
var User = require('../models/User');
var auth = require('../util/auth');

const CACHE_PERSISTENCE = 1000*60*10; // 10 mins
var searchCache = {};
const SEARCH_NUM = 2;

var router = express.Router();
var Event = require('../models/Event');
var Trip = require('../models/Trip');
var User = require('../models/User');
var auth = require('../util/auth');

router.post('/createTrip', (req,res) => {
    var newTrip = req.body;
    var tripId = String(Math.floor(Math.random() * 10000));
    newTrip.tripId = tripId;

    User.getDetails(newTrip.username, (err, user) => {
        if (err == "No such user") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Trip.find(newTrip.tripId, (err, existingTrip) => {
                if (err == "No such trip") {
                    Trip.create(newTrip, (err, newTrip) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }
                        var trip = {S: newTrip.tripId};
                        var updatedTrips = user.trips.L;
                        updatedTrips.push(trip);

                        User.updateTrips(newTrip.username, updatedTrips, (err, updatedUser) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            }
                        })
                        res.send({'tripId': tripId});
                    });
                } else {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                }
            })
        }
    })
});

const deleteHelper = async (currTraveler, tripId) => {
    var newTripsTrav = []
    User.getDetails(currTraveler, (err, traveler) => {
        if (err == "No such user") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            for (var j = 0; j < traveler.trips.L.length; j++) {
                if (traveler.trips.L[j].S === tripId) {
                    continue
                }
                newTripsTrav.push(traveler.trips.L[j])
            }
            User.updateTrips(currTraveler, newTripsTrav, (err, updatedUser) => {
                if (err) {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                }
            })
        }
    })
  }

router.post('/deleteTrip', (req,res) => {
    var username = req.body.username
    var tripId = req.body.tripId

    User.getDetails(username, (err, user) => {
        if (err == "No such user") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Trip.getDetails(tripId, (err, trip) => {
                if (err) {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                } else {
                    var newTrips = []

                    // Remove each trip event
                    for (var i = 0; i < trip.events.L.length; i++) {
                        Event.destroy(trip.events.L[i].S, (err, data) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            }
                        })
                    }

                    // Remove trip from user's trip list
                    for (var i = 0; i < user.trips.L.length; i++) {
                        if (user.trips.L[i].S === tripId) {
                            continue
                        }
                        newTrips.push(user.trips.L[i])
                    }

                    // Remove trip from other traveler's trip lists
                    if (trip.travelers.L.length > 1) {
                        for (var i = 0; i < trip.travelers.L.length; i++) {
                            var currTraveler = trip.travelers.L[i].S
                            if (currTraveler === username) {
                                continue
                            }
                            deleteHelper(currTraveler, tripId)
                        }
                    }

                    // Remove trip itself and update user
                    Trip.destroy(tripId, (err, data) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }

                        User.updateTrips(username, newTrips, (err, updatedUser) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            }
                        })
                    });
                }
            })
        }
    })
});

router.get('/getDetails/:tripId', (req,res) => {
    Trip.find(req.params.tripId, (err, trip) => {
        if (err) {
            console.log(err);
            if (err == "No such trip")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: trip});
    })
});

router.get('/getEvents/:tripId', (req,res) => {
    Trip.getDetails(req.params.tripId, (err, trip) => {
        if (err) {
            console.log(err);
            if (err == "No such trip")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: trip});
    })
});

const unlockHelper = async (eventId) => {
    Event.unlockExpense(eventId, (err, traveler) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        }
    })
  }

router.post('/addToTrip', (req,res) => {
    var username = req.body.friend
    var tripId = req.body.tripId

    User.getDetails(username, (err, user) => {
        if (err == "No such user") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Trip.getDetails(tripId, (err, trip) => {
                if (err) {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                } else {
                    var events = [...trip.events.L]
                    var newTravelers = [...trip.travelers.L]
                    var newTrips = [...user.trips.L]
                    var userInTrip = false
                    var tripInUser = false
                    for (var i = 0; i < newTravelers.length; i++) {
                        if (newTravelers[i].S === username) {
                            userInTrip = true
                        }
                    }
                    for (var i = 0; i < newTrips.length; i++) {
                        if (newTrips[i].S === tripId) {
                            tripInUser = true
                        }
                    }
                    if (!userInTrip) {
                        newTravelers.push({"S": username})
                    }
                    if (!tripInUser) {
                        newTrips.push({"S": tripId})
                    }

                    Trip.updateTravelers(tripId, newTravelers, (err, data) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }

                        User.updateTrips(username, newTrips, (err, updatedUser) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            } else {
                                Trip.unlockExpense(tripId, (err, trip) => {
                                    if (err) {
                                        return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                                    } else {
                                        for (var i = 0; i < events.length; i++) {
                                            unlockHelper(events[i].S)
                                        }
                                    }
                                })
                            }
                        })
                    });
                }
            })
        }
    })
});

router.post('/removeFromTrip', (req,res) => {
    var username = req.body.traveler
    var tripId = req.body.tripId

    User.getDetails(username, (err, user) => {
        if (err == "No such user") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Trip.getDetails(tripId, (err, trip) => {
                if (err) {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                } else {
                    var events = [...trip.events.L]
                    var newTravelers = []
                    var newTrips = []
                    if (trip.travelers.L.length == 1) {
                        return
                    }
                    for (var i = 0; i < trip.travelers.L.length; i++) {
                        if (trip.travelers.L[i].S === username) {
                            continue
                        }
                        newTravelers.push(trip.travelers.L[i])
                    }
                    for (var i = 0; i < user.trips.L.length; i++) {
                        if (user.trips.L[i].S === tripId) {
                            continue
                        }
                        newTrips.push(user.trips.L[i])
                    }

                    
                    Trip.updateTravelers(tripId, newTravelers, (err, data) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }

                        User.updateTrips(username, newTrips, (err, updatedUser) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            } else {
                                Trip.unlockExpense(tripId, (err, trip) => {
                                    if (err) {
                                        return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                                    } else {
                                        for (var i = 0; i < events.length; i++) {
                                            unlockHelper(events[i].S)
                                        }
                                    }
                                })
                            }
                        })
                    });
                }
            })
        }
    })
});

router.post('/lockExpense', (req,res) => {
    var tripId = req.body.tripId

    Trip.lockExpense(tripId, (err, trip) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

router.post('/unlockExpense', (req,res) => {
    var tripId = req.body.tripId

    Trip.unlockExpense(tripId, (err, trip) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

router.get('/computeExpenses/:tripId', (req,res) => {
    Trip.getDetails(req.params.tripId, (err, trip) => {
        if (err) {
            console.log(err);
            if (err == "No such trip")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        
        var travelerList = [...trip.travelers.L]
        for (var i = 0; i < travelerList.length; i++) {
            travelerList[i].cost = 0
        }
        travelerList.push({"S": "N/A", "cost": 0})
        travelerList.push({"S": "", "cost": 0})
        for (var i = 0; i < trip.events.L.length; i++) {
            Event.getDetails(trip.events.L[i].S, (err, event) => {
                if (err) {
                    console.log(err);
                    if (err == "No such trip")
                        return res.status(404).json({'err':true, 'msg':'No such user.'});
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
                } else {
                    for (var i = 0; i < travelerList.length; i++) {
                        if (travelerList[i].S === event.whoPaid.S) {
                            travelerList[i].cost += parseFloat(event.cost.S)
                            break;
                        }
                    }
                }
            })
        }
        res.send({msg: "success", data: travelerList});
    })
});

router.post('/updateExpenseMatrix', (req,res) => {
    var tripId = req.body.tripId
    var expenseMatrix = req.body.expenseMatrix

    for (const [outerKey, outerValue] of Object.entries(expenseMatrix)) {
        for (const [innerKey, innerValue] of Object.entries(outerValue)) {
            var innerMap = {"M": {}}
            innerMap.M["paid"] = (innerValue.toString() === "0") ? {"BOOL": true} : {"BOOL": false}
            innerMap.M["amount"] = {"S": innerValue.toString()}
            expenseMatrix[outerKey][innerKey] = innerMap
        }
        expenseMatrix[outerKey] = {"M": outerValue}
    }

    Trip.updateExpenseMatrix(tripId, expenseMatrix, (err, trip) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

router.post('/togglePayment', (req,res) => {
    var tripId = req.body.tripId
    var sender = req.body.sender
    var recipient = req.body.recipient
    var expenseMatrix = req.body.expenseMatrix

    expenseMatrix[sender].M[recipient].M.paid.BOOL = true

    Trip.updateExpenseMatrix(tripId, expenseMatrix, (err, trip) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

// TODO: Add more routes. 

module.exports = router;
