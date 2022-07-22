const express = require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser, updatePost, getPostsByUser } = require('../db');
const { requireUser } = require("./utils");

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});


usersRouter.get('/', async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.send({
      users
    });

  } catch ({ name, message }) {
    next({ name, message })
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
      const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);
      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: 'IncorrectCredentialsError',
        message: 'Username or password is incorrect'
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post('/register', async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: 'UserExistsError',
        message: 'A user by that username already exists'
      });
    }
    console.log(username, password, location, name);
    const user = await createUser({
      username,
      password,
      name,
      location,
    });
    console.log(user.id, username);
    const token = jwt.sign({
      id: user.id,
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({
      message: "thank you for signing up",
      token
    });
  } catch ({ name, message }) {
    next({ name, message })
  }
});

usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
  try {
    const users = await getUserById(req.params.userId);

    if (users.id === req.user.id) {
      await updateUser(req.params.userId, fields = { active: false });

      const userPosts = await getPostsByUser(req.params.userId)
      for (let i = 0; i < userPosts.length; i++) {
        updatePost(userPosts[i].id, fields = { active: false })
      };
      console.log(userPosts, "!@!@!@!");

      res.send(users);
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot delete this user'
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
  try {
    const users = await getUserById(req.params.userId);

    if (users.id === req.user.id) {
      await updateUser(req.params.userId, fields = { active: true });

      console.log(users)

      res.send(users);
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot activate this user'
      });
    }

  } catch ({ name, message }) {
    next({ name, message })
  }
});

module.exports = usersRouter;