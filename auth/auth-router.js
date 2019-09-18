const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secrets = require('../config/secrets.js');
const Users = require('../users/users-model.js');

router.post('/register', (req, res) => {
    const user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
        .then(saved => {
            res.status(201).json(saved);
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    Users.findBy({ username })
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)) {
                //req.session.user = user;
                const token = generateToken(user);
                res.status(200).json({ token });
            } else {
                res.status(401).json({ message: 'Invalid Credentials' });
            }
        })
        .catch(err => {
            res.status(500).json(err);
        });
});

// function login(username, password) {
//     sers.findBy({ username })
//         .first()
//         .then(user => {
//             if(user && bcrypt.compareSync(password, user.password)) {
//                 //req.session.user = user;
//                 const token = generateToken(user);
//                 // res.status(200).json({ token });
//                 return [200,{token}]
//             } else {
//                 // res.status(401).json({ message: 'Invalid Credentials' });
//                 return [401, {message: 'Invalid Credentials'}]
//             }
//         })
//         .catch(err => {
//             // res.status(500).json(err);
//             return [500, err]
//         });
// }

function generateToken(user) {
    const payload = {
        username: user.username
    };
    const options = {
        expiresIn: '1d'
    };
    return jwt.sign(payload, secrets.jswSecret, options);
}

module.exports = router;