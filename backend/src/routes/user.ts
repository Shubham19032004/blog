
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { SigninInput,signinInput,signupInput } from "@shubham1903/common";
export const userRouter = new Hono<{
    Bindings: {
      DATABASE_URL: string;
      SECRET: string;
    };
  }>();

  userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const {success}=signupInput.safeParse(body)
    if(!success){
      c.status(411)
      return c.json({
        message:"Inputs"
      })
    }
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (user) {
      c.status(400);
      return c.json({ error: "user alreday exist" });
    }
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
        },
      });
      const jwt = await sign({ userid: user.id }, c.env.SECRET);
      return c.json({ jwt });
    } catch (e) {
      c.status(403);
      return c.json({ error: "error while signing up" });
    }
  });
  userRouter.post("/user/signin", async (c) => {
    try {
      const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
      }).$extends(withAccelerate());
      const body = await c.req.json();
      const {success}=signinInput.safeParse(body)
      if(!success){
        c.status(411)
        return c.json({
          message:"Inputs signin"
        })
      }
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
          password: body.password,
        },
      });
      if (!user) {
        c.status(405);
        return c.json({ error: "user not found" });
      }
      const jwt = await sign({ id: user.id }, c.env.SECRET);
      return c.json({ jwt });
    } catch (error) {
      c.status(405);
      return c.json({ error: error });
    }
  });