const express = require("express");
const router = express.Router();
const { User, Show } = require("../models/index");
const { check, validationResult } = require("express-validator");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (request, response) => {
  try {
    const shows = await Show.findAll();
    if (shows.length === 0) {
      response.status(204).send("no shows in database");
    } else {
      response.json(shows);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/:id", async (request, response) => {
  try {
    const show = await Show.findByPk(request.params.id);
    if (show === null) {
      response.status(404).send(`show with id ${request.params.id} not found`);
    } else {
      response.json(show);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/:id/users", async (request, response) => {
  try {
    const show = await Show.findByPk(request.params.id);
    if (show === null) {
      response.status(404).send(`show with id ${request.params.id} not found`);
    } else {
      const users = await show.getUsers();
      response.json(users);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

router.get("/genre/:genre", async (request, response) => {
  const genreNormalised = request.params.genre
    .split(" ")
    .map((word) => {
      const firstLetter = word.charAt(0).toUpperCase();
      const restOfWord = word.slice(1).toLowerCase();
      return firstLetter + restOfWord;
    })
    .join(" ");

  const shows = await Show.findAll({ where: { genre: genreNormalised } });
  if (shows.length === 0) {
    response
      .status(404)
      .send(`shows with the genre ${genreNormalised} were not found`);
  } else {
    response.json(shows);
  }
});

router.put(
  "/rating",
  check(["showId", "rating"]).notEmpty().not().contains(" "),
  async (request, response) => {
    // body = {showId: 1, rating: 1-10}
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        response.json({ error: errors.array() });
      } else {
        const show = await Show.findByPk(request.body.showId);
        if (show === null) {
          response
            .status(404)
            .send(`show with id ${request.body.showId} not found`);
        } else if (
          ![1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(Number(request.body.rating))
        ) {
          response
            .status(404)
            .send("you must enter either --> [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]");
        } else {
          const updatedRating = { rating: request.body.rating };
          await show.update(updatedRating);
          response
            .status(200)
            .send(
              `show with id ${request.body.showId} rating was updated to ${request.body.rating}`
            );
        }
      }
    } catch (error) {
      response.status(500).send(error);
    }
  }
);

router.put(
  "/availability",
  check(["available", "showId"]).notEmpty().not().contains(" "),
  async (request, response) => {
    // body = {showId: 1, available: true/false}
    try {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        response.json({ error: errors.array() });
      } else {
        const show = await Show.findByPk(request.body.showId);
        if (show === null) {
          response
            .status(404)
            .send(`show with id ${request.body.showId} not found`);
        } else if (!["true", "false"].includes(request.body.available)) {
          response.status(404).send("you must enter either true or false");
        } else {
          const updatedAvailibility = { available: request.body.available };
          await show.update(updatedAvailibility);
          response
            .status(200)
            .send(
              `show with id ${request.body.showId} availibility was updated to ${request.body.available}`
            );
        }
      }
    } catch (error) {
      response.status(500).send(error);
    }
  }
);

router.delete("/:id", async (request, response) => {
  try {
    const show = await Show.findByPk(request.params.id);
    if (show === null) {
      response.status(404).send(`show with id ${request.params.id} not found`);
    } else {
      show.destroy();
      response
        .status(200)
        .send(`show with id ${request.params.id} was deleted`);
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

module.exports = router;
