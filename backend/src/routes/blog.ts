import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { createBlogInput,updateBlogInput } from "@shubham1903/blog";
export const blogRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    SECRET: string;
  };
  Variables:{
    userId:string
  }
}>();
blogRoute.use("/*", async (c, next) => {
  const jwt = c.req.header("Authorization");

  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }

  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.SECRET);

  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  console.log("Decoded JWT Payload:", payload);

  c.set("userId", payload.id);

  await next();
});

// blogPost
blogRoute.post("/", async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const {success}=createBlogInput.safeParse(body)
  if(!success){
    c.status(411)
    return c.json({
      message:"Inputs blog"
    })
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: userId,
    },
  });
  return c.json({
    id: post.id,
  });
});
blogRoute.put("/", async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const {success}=updateBlogInput.safeParse(body)
  if(!success){
    c.status(411)
    return c.json({
      message:"Inputs blog"
    })
  }
  prisma.post.update({
    where: {
      id: body.id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.text("updated post");
});
blogRoute.get("/:id", (c) => {
  const id = c.req.param('id')
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const data=prisma.post.findUnique({
    where:{
      id:id
    }
  })
  return c.json({
    data:data
  });
});
blogRoute.get("/blog/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try{
    const blog=await prisma.post.findMany()
    c.status(200)
    return c.json(blog)
  }catch{
    c.status(406)
    return c.json({error:"error in blog bulk"});
  }

});
