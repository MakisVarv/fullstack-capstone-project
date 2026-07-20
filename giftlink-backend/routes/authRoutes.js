const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const dotenv = require('dotenv');
const pino = require('pino');

dotenv.config();

const router = express.Router();
const logger = pino();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const existingEmail = await collection.findOne({
            email: req.body.email,
        });

        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;

        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User registered successfully');
        res.json({ authtoken, email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('users');

        const theUser = await collection.findOne({
            email: req.body.email,
        });

        if (!theUser) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatches = await bcryptjs.compare(
            req.body.password,
            theUser.password
        );

        if (!passwordMatches) {
            logger.error('Passwords do not match');
            return res.status(404).json({ error: 'Wrong password' });
        }

        const payload = {
            user: {
                id: theUser._id.toString(),
            },
        };

        const userName = theUser.firstName;
        const userEmail = theUser.email;
        const authtoken = jwt.sign(payload, JWT_SECRET);

        logger.info('User logged in successfully');

        return res.status(200).json({
            authtoken,
            userName,
            userEmail,
        });
    } catch (e) {
        logger.error(e);
        return res.status(500).json({
            error: 'Internal server error',
            details: e.message,
        });
    }
});

module.exports = router;