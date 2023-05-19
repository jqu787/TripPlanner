var AWS = require('aws-sdk');
var config = require('../config')
AWS.config.update(config.aws_remote_config);

var db = new AWS.DynamoDB();
var { parseData } = require('../util/db')

var find = (eventId, cb) => {

    var params = {
        TableName : "Events",
        KeyConditionExpression: "#event = :event",
        ExpressionAttributeNames: {
            "#event": "eventId"
        },
        ExpressionAttributeValues: {
            ":event": {S: eventId}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            console.log(err)
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such event", null);
        } else {
            cb(null, parseData(data.Items[0]));
        }
    });
}

var getDetails = (eventId, cb) => {

    var params = {
        TableName : "Events",
        KeyConditionExpression: "#event = :event",
        ExpressionAttributeNames: {
            "#event": "eventId"
        },
        ExpressionAttributeValues: {
            ":event": {S: eventId}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such event", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

// Create a new trip
var create = (newEvent, cb) => {

    // Destructuring assignment to get values from updatedTrip
    var {
        eventId,
        name,
        eventCity,
        eventState,
        startDate,
        startTime,
        endDate,
        endTime,
        cost,
        description,
    } = newEvent;
  
    // Set up parameters
    var params = {
        "Item": {
            "eventId":{S:eventId},
            "name":{S:name},
            "eventCity":{S:eventCity},
            "eventState":{S:eventState},
            "startDate":{S:startDate},
            "startTime":{S:startTime},
            "endDate":{S:endDate},
            "endTime":{S:endTime},
            "cost":{S:cost},
            "locked":{S:"false"},
            "whoPaid":{S:""},
            "description":{S:description},
        }, 
        TableName: "Events"
    }
        
    // Then create the trip.
    db.putItem(params, (err, data) => {
        if (err)
            return cb(err)
        cb(null, newEvent);
    });
}

// Update who paid for event
var updateWhoPaid = (eventId, whoPaid, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Events",
        Key: {
            "eventId": {S: eventId}
        },
        UpdateExpression: "set #whoPaid = :x",
        ExpressionAttributeNames: {
            "#whoPaid": "whoPaid"
        },
        ExpressionAttributeValues: {
            ":x": {S: whoPaid}
        }
    }
        
    // Then update the trip.
    db.updateItem(params, (err, data) => {
        if (err) {
            return cb(err)
        }
        cb(null, "success");
    });
}

// lock who paid expense for event
var lockExpense = (eventId, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Events",
        Key: {
            "eventId": {S: eventId}
        },
        UpdateExpression: "set #locked = :x",
        ExpressionAttributeNames: {
            "#locked": "locked"
        },
        ExpressionAttributeValues: {
            ":x": {S: "true"}
        }
    }
        
    // Then update the trip.
    db.updateItem(params, (err, data) => {
        if (err) {
            return cb(err)
        }
        cb(null, "success");
    });
}

// unlock who paid expense for event
var unlockExpense = (eventId, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Events",
        Key: {
            "eventId": {S: eventId}
        },
        UpdateExpression: "set #locked = :x",
        ExpressionAttributeNames: {
            "#locked": "locked"
        },
        ExpressionAttributeValues: {
            ":x": {S: "false"}
        }
    }
        
    // Then update the trip.
    db.updateItem(params, (err, data) => {
        if (err) {
            return cb(err)
        }
        cb(null, "success");
    });
}

var destroy = (eventId, cb) => {
    // parameters to delete user
    var deleteParams = {
        Key: {
            "eventId": {
                S: eventId
            }
        },
        TableName: "Events"
    };
  
    db.deleteItem(deleteParams, (err, data) => {
      if (err)
        cb(err)
      else
        cb(null);
    })
}

module.exports = {
    find,
    getDetails,
    create,
    updateWhoPaid, 
    lockExpense, 
    unlockExpense, 
    destroy,
    // TODO: Add method exports.
}