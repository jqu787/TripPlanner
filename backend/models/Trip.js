var AWS = require('aws-sdk');
var config = require('../config')
AWS.config.update(config.aws_remote_config);

var db = new AWS.DynamoDB();
var { parseData } = require('../util/db')

// Find if a trip exists in the trip table
var find = (tripId, cb) => {

    var params = {
        TableName : "Trips",
        KeyConditionExpression: "#trip = :trip",
        ExpressionAttributeNames: {
            "#trip": "tripId"
        },
        ExpressionAttributeValues: {
            ":trip": {S: tripId}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            console.log(err)
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such trip", null);
        } else {
            cb(null, parseData(data.Items[0]));
        }
    });
}

var getDetails = (tripId, cb) => {

    var params = {
        TableName : "Trips",
        KeyConditionExpression: "#trip = :trip",
        ExpressionAttributeNames: {
            "#trip": "tripId"
        },
        ExpressionAttributeValues: {
            ":trip": {S: tripId}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such trip", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

// Create a new trip
var create = (newTrip, cb) => {

    // Destructuring assignment to get values from updatedTrip
    var {
        tripId,
        name,
        originCity,
        originState,
        destinationCity,
        destinationState,
        category,
        startDate,
        startTime,
        endDate,
        endTime,
        totalBudget,
        totalCost,
        numTravelers,
        travelers,
        events,
    } = newTrip;
  
    // Set up parameters
    var params = {
        "Item": {
            "tripId":{S:tripId},
            "name":{S:name},
            "originCity":{S:originCity},
            "originState":{S:originState},
            "destinationCity":{S:destinationCity},
            "destinationState":{S:destinationState},
            "category":{S:category},
            "startDate":{S:startDate},
            "startTime":{S:startTime},
            "endDate":{S:endDate},
            "endTime":{S:endTime},
            "totalBudget":{S:totalBudget},
            "totalCost":{S:totalCost},
            "numTravelers":{S:numTravelers},
            "travelers":{L:travelers},
            "locked":{S:"false"},
            "events":{L:events},
            "photos":{L:[]},
        }, 
        TableName: "Trips"
    }
        
    // Then create the trip.
    db.putItem(params, (err, data) => {
        if (err)
            return cb(err)
        cb(null, newTrip);
    });
}

// Update trip name
var updateName = (tripId, newName, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": tripId
        },
        UpdateExpression: "set #name = :x",
        ExpressionAttributeNames: {
            "#name": "name"
        },
        ExpressionAttributeValues: {
            ":x": {S: newName}
        }
    }
        
    // Then update the trip.
    db.updateItem(params, (err, data) => {
        if (err)
            return cb(err)
        cb(null, "success");
    });
}

// Update events for trip
var updateEvents = (tripId, newEvents, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
        },
        UpdateExpression: "set #events = :x",
        ExpressionAttributeNames: {
            "#events": "events"
        },
        ExpressionAttributeValues: {
            ":x": {L: newEvents}
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

// Update travelers for trip
var updateTravelers = (tripId, newTravelers, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
        },
        UpdateExpression: "set #travelers = :x",
        ExpressionAttributeNames: {
            "#travelers": "travelers"
        },
        ExpressionAttributeValues: {
            ":x": {L: newTravelers}
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

// Update travelers for trip
var updateExpenseMatrix = (tripId, expenseMatrix, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
        },
        UpdateExpression: "set #expenseMatrix = :x",
        ExpressionAttributeNames: {
            "#expenseMatrix": "expenseMatrix"
        },
        ExpressionAttributeValues: {
            ":x": {M: expenseMatrix}
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

// lock expenses for trip
var lockExpense = (tripId, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
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

// unlock expenses for trip
var unlockExpense = (tripId, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
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

var destroy = (tripId, cb) => {
    // parameters to delete user
    var deleteParams = {
        Key: {
            "tripId": {
                S: tripId
            }
        },
        TableName: "Trips"
    };
  
    db.deleteItem(deleteParams, (err, data) => {
      if (err)
        cb(err)
      else
        cb(null);
    })
}

// Update travelers for trip
var updatePhotos = (tripId, newPhotos, cb) => {
  
    // Set up parameters
    var params = {
        TableName: "Trips",
        Key: {
            "tripId": {S: tripId}
        },
        UpdateExpression: "set #photos = :x",
        ExpressionAttributeNames: {
            "#photos": "photos"
        },
        ExpressionAttributeValues: {
            ":x": {L: newPhotos}
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


// TODO: Add functions to manipulate users table.

module.exports = {
    find,
    getDetails,
    create,
    updateName,
    updateEvents,
    updateTravelers, 
    updateExpenseMatrix,
    lockExpense, 
    unlockExpense,
    destroy,
    updatePhotos,
    // TODO: Add method exports.
}