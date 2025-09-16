const User = require('../models/user'); // Import User Model Schema
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims
const config = require('../config/database'); // Import database configuration

module.exports = (router) => {
    /* ==============
       Register Route
    ============== */
    router.post('/register', async (req, res) => {
        try {
            if (!req.body.email) {
                return res.json({ success: false, user: null, message: 'You must provide an e-mail' });
            }
            if (!req.body.username) {
                return res.json({ success: false, user: null, message: 'You must provide a username' });
            }
            if (!req.body.password) {
                return res.json({ success: false, user: null, message: 'You must provide a password' });
            }

            const user = new User({
                email: req.body.email.toLowerCase(),
                username: req.body.username.toLowerCase(),
                password: req.body.password
            });

            await user.save();
            return res.json({ success: true, message: 'Account registered!' });

        } catch (err) {
            if (err.code === 11000) {
                return res.json({ success: false, user: null, message: 'Username or e-mail already exists' });
            }
            if (err.errors) {
                if (err.errors.email) {
                    return res.json({ success: false, user: null, message: err.errors.email.message });
                }
                if (err.errors.username) {
                    return res.json({ success: false, user: null, message: err.errors.username.message });
                }
                if (err.errors.password) {
                    return res.json({ success: false, user: null, message: err.errors.password.message });
                }
            }
            return res.json({ success: false, user: null, message: 'Could not save user.', error: err.message });
        }
    });

    /* ============================================================
       Check Email
    ============================================================ */
    router.get('/checkEmail/:email', async (req, res) => {
        try {
            if (!req.params.email) {
                return res.json({ success: false, user: null, message: 'E-mail was not provided' });
            }
            const user = await User.findOne({ email: req.params.email });
            if (user) {
                return res.json({ success: false, user: null, message: 'E-mail is already taken' });
            }
            return res.json({ success: true, message: 'E-mail is available' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ===============================================================
       Check Username
    =============================================================== */
    router.get('/checkUsername/:username', async (req, res) => {
        try {
            if (!req.params.username) {
                return res.json({ success: false, user: null, message: 'Username was not provided' });
            }
            const user = await User.findOne({ username: req.params.username });
            if (user) {
                return res.json({ success: false, user: null, message: 'Username is already taken' });
            }
            return res.json({ success: true, message: 'Username is available' });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

    /* ========
       LOGIN
    ======== */
    router.post('/login', async (req, res) => {
        try {
            if (!req.body.username) {
                return res.json({ success: false, user: null, message: 'No username was provided' });
            }
            if (!req.body.password) {
                return res.json({ success: false, user: null, message: 'No password was provided.' });
            }

            const user = await User.findOne({ username: req.body.username.toLowerCase() });
            if (!user) {
                return res.json({ success: false, user: null, message: 'Username not found.' });
            }

            const validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                return res.json({ success: false, user: null, message: 'Password invalid' });
            }

            const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' });
            return res.json({
                success: true,
                message: 'Success!',
                token,
                user: { username: user.username }
            });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

     /* ===============================================================
       Public Profile
    =============================================================== */
    router.get('/publicProfile/:username', async (req, res) => {
        try {
            if (!req.params.username) {
                return res.json({ success: false, user: null, message: 'No username was provided' });
            }
            const user = await User.findOne({ username: req.params.username }).select('username email');
            if (!user) {
                return res.json({ success: false, user: null, message: 'Username not found.' });
            }
            return res.json({ success: true, user });
        } catch (err) {
            return res.json({ success: false, user: null, message: 'Something went wrong: ' + err.message });
        }
    });

    /* ================================================
       Middleware - check JWT
    ================================================ */
    router.use((req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.json({ success: false, user: null, message: 'No token provided' });
        }
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({ success: false, user: null, message: 'Token invalid: ' + err });
            }
            req.decoded = decoded;
            next();
        });
    });

    /* ===============================================================
       Profile
    =============================================================== */
    router.get('/profile', async (req, res) => {
        try {
            const user = await User.findOne({ _id: req.decoded.userId }).select('username email');
            if (!user) {
                return res.json({ success: false, user: null, message: 'User not found' });
            }
            return res.json({ success: true, user });
        } catch (err) {
            return res.json({ success: false, user: null, message: err.message });
        }
    });

   

    return router;
};
