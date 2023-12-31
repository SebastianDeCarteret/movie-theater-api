const express = require("express");
const router = express.Router();
const { User, Show } = require("../models/index");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (request, response) => {
  try {
    const users = await User.findAll();
    if (users.length === 0) {
      response.status(204).send("no shows in database");
    } else {
      response.json(users);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/:id", async (request, response) => {
  const user = await User.findByPk(request.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (user === null) {
    response.status(404).send(`user with id ${request.params.id} not found`);
  } else {
    response.json(user);
  }
});

router.get("/:id/watched", async (request, response) => {
  try {
    const user = await User.findByPk(request.params.id);
    if (user === null) {
      response.status(404).send(`user with id ${request.params.id} not found`);
    } else {
      const shows = await user.getShows();
      response.json(shows);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.put("/:userId", async (request, response) => {
  // body = {showId: 1}
  try {
    const user = await User.findByPk(request.params.userId);
    if (user === null) {
      response
        .status(404)
        .send(`user with id ${request.params.userId} not found`);
    } else {
      const foundShow = await Show.findByPk(request.body.showId);
      if (foundShow === null) {
        response
          .status(404)
          .send(`show with id ${request.body.showId} not found`);
      } else {
        await user.addShow(foundShow);
        response
          .status(200)
          .send(
            `show with id ${request.body.showId} was added to user ${user.username} watched movies`
          );
      }
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;
