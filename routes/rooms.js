const User = require('../models/user'); // Import User Model Schema
const Room = require('../models/room'); // Import Room Model Schema
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require('../config/database'); // Import database configuration

module.exports = (router) => {

    /* ===============================================================
       CREATE NEW BLOG
    =============================================================== */
    router.post('/newRoom', (req, res) => {
        // Check if room title was provided
        if (!req.body.title) {
            res.json({success: false, message: 'Room title is required.'}); // Return error message
        } else {
            // Check if room body was provided
            if (!req.body.body) {
                res.json({success: false, message: 'Room body is required.'}); // Return error message
            } else {
                // Check if room's creator was provided
                if (!req.body.createdBy) {
                    res.json({success: false, message: 'Room creator is required.'}); // Return error
                } else {
                    // Create the room object for insertion into database
                    const room = new Room({
                        title: req.body.title, // Title field
                        body: req.body.body, // Body field
                        createdBy: req.body.createdBy, // CreatedBy field
                        createdAt: req.body.createdAt,// createdAt field
                        startAt: req.body.startAt,// startAt field
                        endsAt: req.body.endsAt,// endsAt field
                        city: req.body.city, // city field
                        reserve: req.body.reserved,// reserved field
                        reservedBy: req.body.reservedBy,
                    });
                    // Save room into database
                    room.save((err) => {
                        // Check if error
                        if (err) {
                            // Check if error is a validation error
                            if (err.errors) {
                                // Check if validation error is in the title field
                                if (err.errors.title) {
                                    res.json({success: false, message: err.errors.title.message}); // Return error message
                                } else {
                                    // Check if validation error is in the body field
                                    if (err.errors.body) {
                                        res.json({success: false, message: err.errors.body.message}); // Return error message
                                    } else {
                                        res.json({success: false, message: err}); // Return general error message
                                    }
                                }
                            } else {
                                res.json({success: false, message: err}); // Return general error message
                            }
                        } else {
                            res.json({success: true, message: 'Room saved!'}); // Return success message
                        }
                    });
                }
            }
        }
    });

    /* ===============================================================
       GET ALL BLOGS
    =============================================================== */
    router.get('/allRooms', (req, res) => {
        // Search database for all room posts
        Room.find({}, (err, rooms) => {
            // Check if error was found or not
            if (err) {
                res.json({success: false, message: err}); // Return error message
            } else {
                // Check if rooms were found in database
                if (!rooms) {
                    res.json({success: false, message: 'No rooms found.'}); // Return error of no rooms found
                } else {
                    res.json({success: true, rooms: rooms}); // Return success and rooms array
                }
            }
        }).sort({'_id': -1}); // Sort rooms from newest to oldest
    });

    /* ===============================================================
   GET SINGLE BLOG
=============================================================== */
    router.get('/singleRoom/:id', (req, res) => {
        // Check if id is present in parameters
        if (!req.params.id) {
            res.json({success: false, message: 'No room ID was provided.'}); // Return error message
        } else {
            // Check if the room id is found in database
            Room.findOne({_id: req.params.id}, (err, room) => {
                // Check if the id is a valid ID
                if (err) {
                    res.json({success: false, message: 'Not a valid room id'}); // Return error message
                } else {
                    // Check if room was found by id
                    if (!room) {
                        res.json({success: false, message: 'Room not found.'}); // Return error message
                    } else {
                        // Find the current user that is logged in
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: err}); // Return error
                            } else {
                                // Check if username was found in database
                                if (!user) {
                                    res.json({success: false, message: 'Unable to authenticate user'}); // Return error message
                                } else {
                                    // Check if the user who requested single room is the one who created it
                                    if (user.username !== room.createdBy) {
                                        res.json({
                                            success: false,
                                            message: 'You are not authorized to eidt this room.'
                                        }); // Return authentication reror
                                    } else {
                                        res.json({success: true, room: room}); // Return success
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    /* ===============================================================
       UPDATE BLOG POST
    =============================================================== */
    router.put('/updateRoom', (req, res) => {
        // Check if id was provided
        if (!req.body._id) {
            res.json({success: false, message: 'No room id provided'}); // Return error message
        } else {
            // Check if id exists in database
            Room.findOne({_id: req.body._id}, (err, room) => {
                // Check if id is a valid ID
                if (err) {
                    res.json({success: false, message: 'Not a valid room id'}); // Return error message
                } else {
                    // Check if id was found in the database
                    if (!room) {
                        res.json({success: false, message: 'Room id was not found.'}); // Return error message
                    } else {
                        // Check who user is that is requesting room update
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: err}); // Return error message
                            } else {
                                // Check if user was found in the database
                                if (!user) {
                                    res.json({success: false, message: 'Unable to authenticate user.'}); // Return error message
                                } else {
                                    // Check if user logged in the the one requesting to update room post
                                    if (user.username !== room.createdBy) {
                                        res.json({
                                            success: false,
                                            message: 'You are not authorized to edit this room post.'
                                        }); // Return error message
                                    } else {
                                        room.title = req.body.title; // Save latest room title
                                        room.body = req.body.body; // Save latest body
                                        room.createdBy = req.body.createdBy; // CreatedBy field
                                        room.createdA = req.body.createdAt;// createdAt field
                                        room.startAt = req.body.startAt;// startAt field
                                        room.endsAt = req.body.endsAt;// endsAt field
                                        room.city = req.body.city;// endsAt field
                                        //room.reserved = req.body.reserved;// reserved field
                                        room.save((err) => {
                                            if (err) {
                                                if (err.errors) {
                                                    res.json({
                                                        success: false,
                                                        message: 'Please ensure form is filled out properly'
                                                    });
                                                } else {
                                                    res.json({success: false, message: err}); // Return error message
                                                }
                                            } else {
                                                res.json({success: true, message: 'Room Updated!'}); // Return success message
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    /* ===============================================================
    DELETE BLOG POST
 =============================================================== */
    router.delete('/deleteRoom/:id', (req, res) => {
        // Check if ID was provided in parameters
        if (!req.params.id) {
            res.json({success: false, message: 'No id provided'}); // Return error message
        } else {
            // Check if id is found in database
            Room.findOne({_id: req.params.id}, (err, room) => {
                // Check if error was found
                if (err) {
                    res.json({success: false, message: 'Invalid id'}); // Return error message
                } else {
                    // Check if room was found in database
                    if (!room) {
                        res.json({success: false, messasge: 'Room was not found'}); // Return error message
                    } else {
                        // Get info on user who is attempting to delete post
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: err}); // Return error message
                            } else {
                                // Check if user's id was found in database
                                if (!user) {
                                    res.json({success: false, message: 'Unable to authenticate user.'}); // Return error message
                                } else {
                                    // Check if user attempting to delete room is the same user who originally posted the room
                                    if (user.username !== room.createdBy) {
                                        res.json({
                                            success: false,
                                            message: 'You are not authorized to delete this room post'
                                        }); // Return error message
                                    } else {
                                        // Remove the room from database
                                        room.remove((err) => {
                                            if (err) {
                                                res.json({success: false, message: err}); // Return error message
                                            } else {
                                                res.json({success: true, message: 'Room deleted!'}); // Return success message
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    /* ===============================================================
    LIKE BLOG POST
 =============================================================== */
    router.put('/likeRoom', (req, res) => {
        // Check if id was passed provided in request body
        if (!req.body.id) {
            res.json({success: false, message: 'No id was provided.'}); // Return error message
        } else {
            // Search the database with id
            Room.findOne({_id: req.body.id}, (err, room) => {
                // Check if error was encountered
                if (err) {
                    res.json({success: false, message: 'Invalid room id'}); // Return error message
                } else {
                    // Check if id matched the id of a room post in the database
                    if (!room) {
                        res.json({success: false, message: 'That room was not found.'}); // Return error message
                    } else {
                        // Get data from user that is signed in
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: 'Something went wrong.'}); // Return error message
                            } else {
                                // Check if id of user in session was found in the database
                                if (!user) {
                                    res.json({success: false, message: 'Could not authenticate user.'}); // Return error message
                                } else {
                                    // Check if user who liked post is the same user that originally created the room post
                                    if (user.username === room.createdBy) {
                                        res.json({success: false, message: 'Cannot like your own post.'}); // Return error message
                                    } else {
                                        // Check if the user who liked the post has already liked the room post before
                                        if (room.likedBy.includes(user.username)) {
                                            res.json({success: false, message: 'You already liked this post.'}); // Return error message
                                        } else {
                                            // Check if user who liked post has previously disliked a post
                                            if (room.dislikedBy.includes(user.username)) {
                                                room.dislikes--; // Reduce the total number of dislikes
                                                const arrayIndex = room.dislikedBy.indexOf(user.username); // Get the index of the username in the array for removal
                                                room.dislikedBy.splice(arrayIndex, 1); // Remove user from array
                                                room.likes++; // Increment likes
                                                room.likedBy.push(user.username); // Add username to the array of likedBy array
                                                // Save room post data
                                                room.save((err) => {
                                                    // Check if error was found
                                                    if (err) {
                                                        res.json({success: false, message: 'Something went wrong.'}); // Return error message
                                                    } else {
                                                        res.json({success: true, message: 'Room liked!'}); // Return success message
                                                    }
                                                });
                                            } else {
                                                room.likes++; // Incriment likes
                                                room.likedBy.push(user.username); // Add liker's username into array of likedBy
                                                // Save room post
                                                room.save((err) => {
                                                    if (err) {
                                                        res.json({success: false, message: 'Something went wrong.'}); // Return error message
                                                    } else {
                                                        res.json({success: true, message: 'Room liked!'}); // Return success message
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    /* ===============================================================
       DISLIKE BLOG POST
    =============================================================== */
    router.put('/dislikeRoom', (req, res) => {
        // Check if id was provided inside the request body
        if (!req.body.id) {
            res.json({success: false, message: 'No id was provided.'}); // Return error message
        } else {
            // Search database for room post using the id
            Room.findOne({_id: req.body.id}, (err, room) => {
                // Check if error was found
                if (err) {
                    res.json({success: false, message: 'Invalid room id'}); // Return error message
                } else {
                    // Check if room post with the id was found in the database
                    if (!room) {
                        res.json({success: false, message: 'That room was not found.'}); // Return error message
                    } else {
                        // Get data of user who is logged in
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: 'Something went wrong.'}); // Return error message
                            } else {
                                // Check if user was found in the database
                                if (!user) {
                                    res.json({success: false, message: 'Could not authenticate user.'}); // Return error message
                                } else {
                                    // Check if user who disliekd post is the same person who originated the room post
                                    if (user.username === room.createdBy) {
                                        res.json({success: false, message: 'Cannot dislike your own post.'}); // Return error message
                                    } else {
                                        // Check if user who disliked post has already disliked it before
                                        if (room.dislikedBy.includes(user.username)) {
                                            res.json({success: false, message: 'You already disliked this post.'}); // Return error message
                                        } else {
                                            // Check if user has previous disliked this post
                                            if (room.likedBy.includes(user.username)) {
                                                room.likes--; // Decrease likes by one
                                                const arrayIndex = room.likedBy.indexOf(user.username); // Check where username is inside of the array
                                                room.likedBy.splice(arrayIndex, 1); // Remove username from index
                                                room.dislikes++; // Increase dislikeds by one
                                                room.dislikedBy.push(user.username); // Add username to list of dislikers
                                                // Save room data
                                                room.save((err) => {
                                                    // Check if error was found
                                                    if (err) {
                                                        res.json({success: false, message: 'Something went wrong.'}); // Return error message
                                                    } else {
                                                        res.json({success: true, message: 'Room disliked!'}); // Return success message
                                                    }
                                                });
                                            } else {
                                                room.dislikes++; // Increase likes by one
                                                room.dislikedBy.push(user.username); // Add username to list of likers
                                                // Save room data
                                                room.save((err) => {
                                                    // Check if error was found
                                                    if (err) {
                                                        res.json({success: false, message: 'Something went wrong.'}); // Return error message
                                                    } else {
                                                        res.json({success: true, message: 'Room disliked!'}); // Return success message
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });

    /* ===============================================================
    reserve ON ROOM POST
 =============================================================== */
    router.put('/reserve', (req, res) => {
        // Check if id was provided inside the request body
        if (!req.body.id) {
            res.json({success: false, message: 'No id was provided.'}); // Return error message
        } else {
            // Search database for room post using the id
            Room.findOne({_id: req.body.id}, (err, room) => {
                // Check if error was found
                if (err) {
                    res.json({success: false, message: 'Invalid room id'}); // Return error message
                } else {
                    // Check if room post with the id was found in the database
                    if (!room) {
                        res.json({success: false, message: 'That room was not found.'}); // Return error message
                    } else {
                        // Get data of user who is logged in
                        User.findOne({_id: req.decoded.userId}, (err, user) => {
                            // Check if error was found
                            if (err) {
                                res.json({success: false, message: 'Something went wrong.'}); // Return error message
                            } else {
                                // Check if user was found in the database
                                if (!user) {
                                    res.json({success: false, message: 'Could not authenticate user.'}); // Return error message
                                } else {
                                    // Check if user who disliekd post is the same person who originated the room post
                                    if (user.username === room.createdBy) {
                                        res.json({success: false, message: 'Cannot reserve your own post.'}); // Return error message
                                        console.log('Cannot reserve your own post.');
                                    } else {
                                        // Check if user who reserved post has already reserved it before
                                        if (room.reserve === true) {
                                            res.json({success: false, message: 'Someone else reserved this room.'});
                                            console.log('Someone else reserved this room.')// Return error message
                                        } else {
                                            // Check if user has previous disliked this post
                                            if (room.reservedBy !== user.username) {
                                                 // Check where username is inside of the array
                                                room.reservedBy = user.username; // Remove username from index
                                                room.reserve = true; // Increase likes by one
                                                console.log('room reserved');
                                                console.log(user.username);
                                                console.log(room.reservedBy);
                                                // Save room data
                                                room.save((err) => {
                                                    // Check if error was found
                                                    if (err) {
                                                        res.json({success: false, message: 'Something went wrong.'}); // Return error message
                                                    } else {
                                                        res.json({success: true, message: 'Room reserved!'}); // Return success message
                                                        console.log('room reserved222');
                                                    }
                                                });
                                            } else {
                                                res.json({success: false, message: ' u cant reserve this room'});
                                                console.log('u cant reserve this room');

                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    });


    return router;
};