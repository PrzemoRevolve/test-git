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
