"use strict";

const User = require("./user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testRecipeIds
} = require("./_testCommon");

const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("User.authenticate", () => {
  test("works with valid credentials", async () => {
    const user = await User.authenticate("user1", "password1");
    expect(user).toEqual({
      username: "user1",
      first_name: "User1First",
      last_name: "User1Last",
      email: "user1@example.com",
      is_admin: false
    });
  });

  test("throws UnauthorizedError with invalid credentials", async () => {
    try {
      await User.authenticate("testuser", "wrongpassword");
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("User.register", () => {
  test("registers a new user", async () => {
    const user = await User.register({
      username: "testinguser",
      password: "password",
      first_name: "New",
      last_name: "User",
      email: "testinguser@example.com",
      is_admin: true
    });
    expect(user).toEqual({
      username: "testinguser",
      first_name: "New",
      last_name: "User",
      email: "testinguser@example.com",
      is_admin: true
    });
  });

  test("throws BadRequestError on duplicate registration", async () => {
    try {
      await User.register({
        username: "testuser",
        password: "password",
        first_name: "Test",
        last_name: "User",
        email: "testuser@example.com",
        is_admin: false
      });
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("User.findAll", () => {
  test("retrieves all users", async () => {
    const users = await User.findAll();
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users).toEqual([
      { username: "user1", 
        first_name: "User1First", 
        last_name: "User1Last", 
        email: "user1@example.com", 
        is_admin: false 
      },
      { 
        username: "user2", 
        first_name: "User2First", 
        last_name: "User2Last", 
        email: "user2@example.com", 
        is_admin: true
      },
    ]);
  });
});

describe("User.get", () => {
  test("retrieves a user by username", async () => {
    const user = await User.get("user1");
    expect(user).toEqual(
      expect.objectContaining({ 
        username: "user1", 
        first_name: "User1First", 
        last_name: "User1Last", 
        email: "user1@example.com", 
        is_admin: false 
      }));
  });

  test("throws NotFoundError if user not found", async () => {
    try {
      await User.get("unknownuser");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("retrieves selected users submitted recipes", async () => {
    const user = await User.get("user1");
    expect(user).toEqual(
      expect.objectContaining({
        recipes: expect.arrayContaining([ // should be an array of recipe objects
          expect.objectContaining({
            username: "user1",
            title: "Recipe1",
            recipe_description: "Delicious dish 1",
            preparation_time: 10,
            cooking_time: 20,
            servings: 2,
          }),
          expect.objectContaining({
            username: "user1",
            title: "Recipe3",
            recipe_description: "Amazing dish 3",
            preparation_time: 5,
            cooking_time: 15,
            servings: 1,
          }),
        ])
      }),
    );
  });

  test("retrieves selected users favorited recipes", async () => {
    // save a recipe first
    await User.saveRecipe("user1", testRecipeIds[1]);
    const user = await User.get("user1");

    expect(user).toEqual(expect.objectContaining({
      favorites: expect.arrayContaining([
        expect.objectContaining({
          title: "Recipe2",
        }),
      ]),
    }));
  });
});

describe("User.update", () => {
  test("updates a user's data", async () => {
    const updatedUser = await User.update("user1", { first_name: "Updated" });
    expect(updatedUser).toEqual(
      expect.objectContaining({
        username: "user1", 
        first_name: "Updated", 
        last_name: "User1Last", 
        email: "user1@example.com", 
        is_admin: false 
      })
    );
  });

  test("throws NotFoundError if user not found", async () => {
    try {
      await User.update("unknownuser", { first_name: "NoUser" });
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("User.remove", () => {
  test("deletes a user", async () => {
    const response = await User.remove("user1");
    expect(response.message).toBe("user deleted successfully!");

    try {
      await User.get("nonexistentuser");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("throws NotFoundError if user not found", async () => {
    try {
      await User.remove("unknownuser");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("User.saveRecipe", () => {
  test("saves a recipe for a user", async () => {
    const response = await User.saveRecipe("user1", testRecipeIds[1]);
    expect(response).toEqual({
      username: "user1",
      recipe_id: testRecipeIds[1],
      message: "Recipe saved successfully"
    });
  });

  test("throws NotFoundError if user or recipe not found", async () => {
    try {
      await User.saveRecipe("unknownuser", testRecipeIds[0]);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("user.unsaveRecipe", () => {
  test("unsaves recipe for a user", async () => {
    // save a recipe first
    await User.saveRecipe("user1", testRecipeIds[1]);

    const response = await User.unsaveRecipe("user1", testRecipeIds[1]);
    expect(response).toEqual({
      username: "user1",
      recipe_id: testRecipeIds[1],
      message: "Recipe unsaved successfully"
    });
  })
})
