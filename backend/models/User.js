var AWS = require('aws-sdk');
var config = require('../config')
AWS.config.update(config.aws_remote_config);

var db = new AWS.DynamoDB();
var { parseData } = require('../util/db')

// Find if a user exists in the user table
var find = (username, cb) => {

    var params = {
        TableName : "Users",
        KeyConditionExpression: "#usr = :user",
        ExpressionAttributeNames: {
            "#usr": "username"
        },
        ExpressionAttributeValues: {
            ":user": {S: username}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such user", null);
        } else {
            cb(null, parseData(data.Items[0]));
        }
    });
}

var getDetails = (username, cb) => {

    var params = {
        TableName : "Users",
        KeyConditionExpression: "#user = :user",
        ExpressionAttributeNames: {
            "#user": "username"
        },
        ExpressionAttributeValues: {
            ":user": {S: username}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such user", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

// Find trips of a particular user
var findTrips = (username, cb) => {

    var params = {
        TableName : "Users",
        KeyConditionExpression: "#usr = :user",
        ExpressionAttributeNames: {
            "#usr": "username"
        },
        ExpressionAttributeValues: {
            ":user": {S: username}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such user", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

// Find friends of a particular user
var findFriends = (username, cb) => {

    var params = {
        TableName : "Users",
        KeyConditionExpression: "#usr = :user",
        ExpressionAttributeNames: {
            "#usr": "username"
        },
        ExpressionAttributeValues: {
            ":user": {S: username}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such user", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

// Find friends of a particular user
var findFriendRequests = (username, cb) => {

    var params = {
        TableName : "Users",
        KeyConditionExpression: "#usr = :user",
        ExpressionAttributeNames: {
            "#usr": "username"
        },
        ExpressionAttributeValues: {
            ":user": {S: username}
        }
    };

    db.query(params, function(err, data) {
        if (err) {
            cb(err, null);
        } else if (data.Items.length == 0) {
            cb("No such user", null);
        } else {
            cb(null, data.Items[0]);
        }
    });
}

var create = (newUser, cb)  => {

	// Destructuring assignment to get values from newUser parameter
	var {
        username,
        password,
        firstName,
        lastName,
        email,
        trips,
        friendRequests,
        friends,
    } = newUser;
	
	// first check if user already exists
	find(username, (err, user) => {
		if (user)
			return cb("User with that username already exists!", null);
			
		// Set up parameters
		var params = {
			"Item": {
				"username":{S:username},
                "password":{S:password},
                "firstName":{S:firstName},
                "lastName":{S:lastName},
                "email":{S:email},
                "trips":{L:trips},
                "friendRequests":{L:friendRequests},
                "friends":{L:friends},
			}, 
			TableName: "Users"
		}
		
		// Then create the user.
		db.putItem(params, (err, data) => {
			if (err)
				return cb(err)
			cb(null, newUser);
		});
	})
}

var destroy = (user, cb) => {
    // parameters to delete user
    var deleteParams = {
        Key: {
            "username": {
                S: user
            }
        },
        TableName: "Users"
    };
  
    db.deleteItem(deleteParams, (err, data) => {
      if (err)
        cb(err)
      else
        cb(null);
    })
}

// Update trip list for user
var updateTrips = (username, newTrips, cb) => {

    // Set up parameters
    var params = {
        TableName: "Users",
        Key: {
            "username": {S: username}
        },
        UpdateExpression: "set #trips = :x",
        ExpressionAttributeNames: {
            "#trips": "trips"
        },
        ExpressionAttributeValues: {
            ":x": {L: newTrips}
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

// Update friendRequest list for user
var updateFriendRequests = (username, newRequests, cb) => {

    // Set up parameters
    var params = {
        TableName: "Users",
        Key: {
            "username": {S: username}
        },
        UpdateExpression: "set #friendRequests = :x",
        ExpressionAttributeNames: {
            "#friendRequests": "friendRequests"
        },
        ExpressionAttributeValues: {
            ":x": {L: newRequests}
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

// Update friends list for user
var updateFriends = (username, newFriends, cb) => {

    // Set up parameters
    var params = {
        TableName: "Users",
        Key: {
            "username": {S: username}
        },
        UpdateExpression: "set #friends = :x",
        ExpressionAttributeNames: {
            "#friends": "friends"
        },
        ExpressionAttributeValues: {
            ":x": {L: newFriends}
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
    updateTrips,
    findTrips,
    findFriends,
    findFriendRequests,
    updateFriendRequests,
    updateFriends,
    create, 
    destroy,
    // TODO: Add method exports.
}