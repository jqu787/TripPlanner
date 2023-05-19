var express = require('express')
var router = express.Router();
var Event = require('../models/Event');
var Trip = require('../models/Trip');
var auth = require('../util/auth');

router.post('/addEvent', (req,res) => {
    var newEvent = req.body;
    var eventId = String(Math.floor(Math.random() * 10000));
    newEvent.eventId = eventId;

    Trip.getDetails(newEvent.tripId, (err, trip) => {
        if (err == "No such trip") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Event.find(newEvent.eventId, (err, event) => {
                if (err == "No such event") {
                    Event.create(newEvent, (err, event) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }
                        var event = {S: newEvent.eventId};
                        var updatedEvents = trip.events.L;
                        updatedEvents.push(event);

                        Trip.updateEvents(newEvent.tripId, updatedEvents, (err, updatedTrip) => {
                            if (err) {
                                return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                            }
                        })
                        res.send({'eventId': eventId});
                    });
                } else {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                }
            })
        }
    })
});

router.post('/removeEvent', (req,res) => {
    var newEvent = req.body;

    Trip.getDetails(newEvent.tripId, (err, trip) => {
        if (err == "No such trip") {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'})
        } else {
            Event.find(newEvent.eventId, (err, event) => {
                if (err) {
                    return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                } else {
                    Event.destroy(newEvent.eventId, (err, data) => {
                        if (err) {
                            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
                        }

                        var updatedEvents = trip.events.L;
                        var index = -1;
                        if (updatedEvents.length > 0) {
                            for (var i=0; i<updatedEvents.length; i++) {
                                if (updatedEvents[i].S === newEvent.eventId) {
                                    index = i;
                                }
                            }
                        }
                        if (index > -1) {
                            updatedEvents.splice(index, 1)
                        }

                        Trip.updateEvents(newEvent.tripId, updatedEvents, (err, updatedTrip) => {
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

router.get('/getDetails/:eventId', (req,res) => {
    Event.getDetails(req.params.eventId, (err, event) => {
        if (err) {
            console.log(err);
            if (err == "No such trip")
                return res.status(404).json({'err':true, 'msg':'No such user.'});
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error.'}) 
        }
        res.send({msg: "success", data: event});
    })
});

router.post('/addWhoPaid', (req,res) => {
    var eventId = req.body.eventId
    var whoPaid = req.body.whoPaid
    Event.updateWhoPaid(eventId, whoPaid, (err, event) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

router.post('/lockExpense', (req,res) => {
    var eventId = req.body.eventId
    Event.lockExpense(eventId, (err, event) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

router.post('/unlockExpense', (req,res) => {
    var eventId = req.body.eventId
    Event.unlockExpense(eventId, (err, event) => {
        if (err) {
            return res.status(500).json({'err':true, 'msg': 'There was an internal server error. Try again.'}) 
        }
    })
});

module.exports = router;