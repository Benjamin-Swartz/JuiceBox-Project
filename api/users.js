const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next();
});

const { getAllUsers, getUserByUsername } = require('../db');

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.send({
            users
        });
        
    } catch ({name, message}) {
        next({name, message})
    }
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
  
    // request must have both
    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }
  
    try {
      const user = await getUserByUsername(username);
  
      if (user && user.password == password) {
        // create token & return to user
        const token = jwt.sign((user.id, username), process.env.JWT_SECRET); 
        res.send({ message: "you're logged in!", token });
      } else {
        next({ 
          name: 'IncorrectCredentialsError', 
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

module.exports = usersRouter;