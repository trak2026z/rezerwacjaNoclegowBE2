const User = require('../models/user'); // Import User Model Schema
const Room = require('../models/room'); // Import Room Model Schema

const checkAuth = require('../middleware/auth');


module.exports = (router) => {
    /* ===============================================================
       CREATE NEW ROOM
    =============================================================== */
    router.post('/newRoom', async (req, res) => {
        try {
            if (!req.body.title) {
                return res.json({ success: false, user: null, message: 'Room title is required.' });
            }
            if (!req.body.body) {
                return res.json({ success: false, user: null, message: 'Room body is required.' });
            }
            if (!req.body.createdBy) {
                return res.json({ success: false, user: null, message: 'Room creator is required.' });
            }

            const room = new Room({
                title: req.body.title,
                body: req.body.body,
                createdBy: req.body.createdBy,
                createdAt: req.body.createdAt,
                startAt: req.body.startAt,
                endsAt: req.body.endsAt,
                city: req.body.city,
                reserve: req.body.reserved,
                reservedBy: req.body.reservedBy,
            });

            await room.save();
            return res.json({ success: true, message: 'Room saved!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       GET ALL ROOMS
    =============================================================== */
    router.get('/allRooms', async (req, res) => {
        try {
            const rooms = await Room.find({}).sort({ _id: -1 });
            if (!rooms || rooms.length === 0) {
                return res.json({ success: false, user: null, message: 'No rooms found.' });
            }
            return res.json({ success: true, rooms });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       GET SINGLE ROOM
    =============================================================== */
    router.get('/singleRoom/:id', async (req, res) => {
        try {
            if (!req.params.id) {
                return res.json({ success: false, user: null, message: 'No room ID was provided.' });
            }

            const room = await Room.findById(req.params.id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found.' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Unable to authenticate user' });
            }

            if (user.username !== room.createdBy) {
                return res.json({ success: false, user: null, message: 'You are not authorized to edit this room.' });
            }

            return res.json({ success: true, room });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       UPDATE ROOM
    =============================================================== */
    router.put('/updateRoom', async (req, res) => {
        try {
            if (!req.body._id) {
                return res.json({ success: false, user: null, message: 'No room id provided' });
            }

            const room = await Room.findById(req.body._id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found.' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Unable to authenticate user.' });
            }

            if (user.username !== room.createdBy) {
                return res.json({ success: false, user: null, message: 'You are not authorized to edit this room.' });
            }

            room.title = req.body.title;
            room.body = req.body.body;
            room.createdBy = req.body.createdBy;
            room.createdAt = req.body.createdAt;
            room.startAt = req.body.startAt;
            room.endsAt = req.body.endsAt;
            room.city = req.body.city;

            await room.save();
            return res.json({ success: true, message: 'Room updated!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       DELETE ROOM
    =============================================================== */
    router.delete('/deleteRoom/:id', async (req, res) => {
        try {
            if (!req.params.id) {
                return res.json({ success: false, user: null, message: 'No id provided' });
            }

            const room = await Room.findById(req.params.id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Unable to authenticate user.' });
            }

            if (user.username !== room.createdBy) {
                return res.json({ success: false, user: null, message: 'You are not authorized to delete this room' });
            }

            await Room.deleteOne({ _id: req.params.id });
            return res.json({ success: true, message: 'Room deleted!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       LIKE ROOM
    =============================================================== */
    router.put('/likeRoom', async (req, res) => {
        try {
            if (!req.body.id) {
                return res.json({ success: false, user: null, message: 'No id was provided.' });
            }

            const room = await Room.findById(req.body.id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found.' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Could not authenticate user.' });
            }

            if (user.username === room.createdBy) {
                return res.json({ success: false, user: null, message: 'Cannot like your own post.' });
            }

            if (room.likedBy.includes(user.username)) {
                return res.json({ success: false, user: null, message: 'You already liked this post.' });
            }

            if (room.dislikedBy.includes(user.username)) {
                room.dislikes--;
                room.dislikedBy = room.dislikedBy.filter(u => u !== user.username);
            }

            room.likes++;
            room.likedBy.push(user.username);

            await room.save();
            return res.json({ success: true, message: 'Room liked!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       DISLIKE ROOM
    =============================================================== */
    router.put('/dislikeRoom', async (req, res) => {
        try {
            if (!req.body.id) {
                return res.json({ success: false, user: null, message: 'No id was provided.' });
            }

            const room = await Room.findById(req.body.id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found.' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Could not authenticate user.' });
            }

            if (user.username === room.createdBy) {
                return res.json({ success: false, user: null, message: 'Cannot dislike your own post.' });
            }

            if (room.dislikedBy.includes(user.username)) {
                return res.json({ success: false, user: null, message: 'You already disliked this post.' });
            }

            if (room.likedBy.includes(user.username)) {
                room.likes--;
                room.likedBy = room.likedBy.filter(u => u !== user.username);
            }

            room.dislikes++;
            room.dislikedBy.push(user.username);

            await room.save();
            return res.json({ success: true, message: 'Room disliked!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       RESERVE ROOM
    =============================================================== */
    router.put('/reserve', async (req, res) => {
        try {
            if (!req.body.id) {
                return res.json({ success: false, user: null, message: 'No id was provided.' });
            }

            const room = await Room.findById(req.body.id);
            if (!room) {
                return res.json({ success: false, user: null, message: 'Room not found.' });
            }

            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return res.json({ success: false, user: null, message: 'Could not authenticate user.' });
            }

            if (user.username === room.createdBy) {
                return res.json({ success: false, user: null, message: 'Cannot reserve your own room.' });
            }

            if (room.reserve === true) {
                return res.json({ success: false, user: null, message: 'Someone else reserved this room.' });
            }

            if (room.reservedBy && room.reservedBy === user.username) {
                return res.json({ success: false, user: null, message: 'You already reserved this room.' });
            }

            room.reservedBy = user.username;
            room.reserve = true;

            await room.save();
            return res.json({ success: true, message: 'Room reserved!' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    return router;
};
