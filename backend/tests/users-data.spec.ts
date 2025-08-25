import { expect, test, APIRequestContext } from "@playwright/test";
import { z } from "zod";
import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

let apiContext: APIRequestContext;
let userIds: Array<number>;

const schema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  created_at: z.string(),
});

const pgClient = new Client({
  user: "postgres",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "blogdb",
});

test.beforeEach(async ({ playwright }) => {
  try {
    const userName1 = uuidv4();
    const userName2 = uuidv4();

    await pgClient.connect();
    const res = await pgClient.query(
      `INSERT INTO public.users(name, email) values ('${userName1}', '${userName1}@test.com'), ('${userName2}', '${userName2}@test.com') returning *`
    );
    userIds = res.rows.map((user) => user.id);
  } catch (error) {
    throw new Error(error);
  }

  apiContext = await playwright.request.newContext({
    baseURL: "http://localhost:3000",
  });
});

test.afterEach(async ({}) => {
  try {
    await pgClient.query(
      `DELETE FROM public.users WHERE ID in (${userIds.join(",")})`
    );
  } catch (error) {
    throw new Error(error);
  }
  await apiContext.dispose();
});

test("should be able to get user data", async () => {
  for await (const userId of userIds) {
    const getRes = await apiContext.get(`/users/${userId}`);
    const resBody = await getRes.json();

    expect(getRes.status()).toBe(200);
    expect(() => schema.parse(resBody)).not.toThrow();
  }
});

test("should be able to update user", async () => {
  for await (const userId of userIds) {
    const updatedName = `test${userId}`;
    const updatedEmail = `test${userId}@test.com`;

    const putRes = await apiContext.put(`/users/${userId}`, {
      data: { name: updatedName, email: updatedEmail },
    });
    const resBody = await putRes.json();

    expect(putRes.status()).toBe(200);
    expect(() => schema.parse(resBody)).not.toThrow();
    expect(resBody).toMatchObject({
      id: userId,
      name: updatedName,
      email: updatedEmail,
    });
  }
});

test("should be able to create user", async () => {
  const newName = uuidv4();
  const newEmail = `${newName}@test.com`;
  const postRes = await apiContext.post("/users", {
    data: { name: newName, email: newEmail },
  });
  const resBody = await postRes.json();

  expect(postRes.status()).toBe(201);
  expect(() => schema.parse(resBody)).not.toThrow();
  expect(resBody).toMatchObject({
    name: newName,
    email: newEmail,
  });

  // Add created user ID to userIds array for cleanup
  userIds.push(resBody.id);
});

test("should be able to delete created user", async () => {
  // Create a new user
  const newName = uuidv4();
  const newEmail = `${newName}@test.com`;
  const postRes = await apiContext.post("/users", {
    data: { name: newName, email: newEmail },
  });
  const createdUser = await postRes.json();

  expect(postRes.status()).toBe(201);
  expect(() => schema.parse(createdUser)).not.toThrow();
  expect(createdUser).toMatchObject({
    name: newName,
    email: newEmail,
  });

  // Delete the created user
  const deleteRes = await apiContext.delete(`/users/${createdUser.id}`);
  expect(deleteRes.status()).toBe(200);

  // Optionally, verify user no longer exists
  const getRes = await apiContext.get(`/users/${createdUser.id}`);
  expect(getRes.status()).toBe(404);
});

test("should not create user with missing required fields", async () => {
  const res = await apiContext.post("/users", { data: { name: "" } });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("should not create user with invalid email format", async () => {
  const res = await apiContext.post("/users", { data: { name: "Test", email: "not-an-email" } });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("should not update user with invalid data", async () => {
  const userId = userIds[0];
  const res = await apiContext.put(`/users/${userId}`, { data: { name: "", email: "bademail" } });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});

test("should return 404 when updating non-existent user", async () => {
  const res = await apiContext.put(`/users/9999999`, { data: { name: "Test", email: "test@test.com" } });
  expect(res.status()).toBe(404);
});

test("should return 404 when deleting non-existent user", async () => {
  const res = await apiContext.delete(`/users/9999999`);
  expect(res.status()).toBe(404);
});

test("should return 404 when retrieving non-existent user", async () => {
  const res = await apiContext.get(`/users/9999999`);
  expect(res.status()).toBe(404);
});

test("should not allow duplicate emails", async () => {
  const name = uuidv4();
  const email = `${name}@test.com`;
  // Create first user
  const res1 = await apiContext.post("/users", { data: { name, email } });
  expect(res1.status()).toBe(201);
  const user = await res1.json();
  userIds.push(user.id);
  // Try to create second user with same email
  const res2 = await apiContext.post("/users", { data: { name: uuidv4(), email } });
  expect([400, 409]).toContain(res2.status());
});

test("should list all users", async () => {
  const res = await apiContext.get("/users");
  expect(res.status()).toBe(200);
  const users = await res.json();
  expect(Array.isArray(users)).toBe(true);
  expect(users.length).toBeGreaterThanOrEqual(userIds.length);
});

test("should be able to partially update user (PATCH)", async () => {
  const userId = userIds[0];
  const newName = `patched-${uuidv4()}`;
  const res = await apiContext.patch(`/users/${userId}`, { data: { name: newName } });
  // Accept 200 or 204 depending on implementation
  expect([200, 204]).toContain(res.status());
});

test("should not allow SQL injection in user fields", async () => {
  const res = await apiContext.post("/users", { data: { name: "Robert'); DROP TABLE users;--", email: "sqltest@test.com" } });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});