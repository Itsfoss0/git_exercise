#!/usr/bin/env node

/* Router for the api/blogs endpoint */
const opentelemetry = require("@opentelemetry/api");
const { tokenExtractor, userExtractor } = require("../middleware/auth");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.use(tokenExtractor);
blogRouter.use(userExtractor);

const tracer = opentelemetry.trace.getTracer("bloglist");

blogRouter.get("/", async (request, response) => {
  const span = tracer.startSpan("get-all-blogs");
  span.setAttribute("component", "blogs-router");

  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });

    if (blogs.length > 0) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
      return response.json(blogs);
    }

    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    return response.status(204).end();
  } catch (error) {
    span.setStatus({
      code: opentelemetry.SpanStatusCode.ERROR,
      message: error.message,
    });
    return response.status(500).json({ error: "Internal Server Error" });
  } finally {
    console.log(span)
    span.end();
  }
});

blogRouter.get("/:id", async (request, response) => {
  const span = tracer.startSpan("get-blog");
  try {
    const blogId = request.params.id;
    const blog = await Blog.findById(blogId);
    if (blog) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
      return response.json(blog);
    }
    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
    return response.status(404).json({ error: "No blog matches that id" });
  } catch (error) {
    span.setStatus({
      code: opentelemetry.SpanStatusCode.ERROR,
      message: error.message,
    });
    return response.status(505).json({ error: "Internal server error" });
  } finally {
    console.log(span)
    span.end();
  }
});

blogRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const user = request.user;
  const span = tracer.startSpan("delete-blog");

  try {
    if (!token) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response.status(401).json({ error: "login and try again" });
    }
    const blogId = request.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response.status(404).json({ error: "blog not found" });
    }
    if (blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(blogId);
      span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
      return response.status(204).end();
    }
    span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
    return response
      .status(403)
      .json({ error: "not authorized to delete this blog" });
  } finally {
    span.end();
  }
});

blogRouter.post("/", async (request, response) => {
  const token = request.token;
  const requser = request.user;
  const span = tracer.startSpan("create-blog");
  try {
    if (!token) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response
        .status(403)
        .json({ error: "unauthorized, login and try again" });
    }
    const body = request.body;
    const blog = new Blog({
      author: body.author,
      title: body.title,
      url: body.url,
      user: requser._id,
    });
    await blog.save();
    const user = await User.findById(requser._id);
    user.blogs = user.blogs.concat(blog._id);
    await user.save();
    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    return response.status(201).json(blog);
  } finally {
    span.end();
  }
});

blogRouter.put("/:id", async (request, response) => {
  const token = request.token;
  const user = request.user;
  const span = tracer.startSpan("modify-blog");

  const { likes, title, url, author } = request.body;
  const blogId = request.params.id;

  try {
    if (!token) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response.status(401).json({ error: "login and try again" });
    }
    const blog = await Blog.findById(blogId);
    if (!blog) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response.status(404).json({ error: "blog not found" });
    }
    if (blog.user.toString() !== user._id.toString()) {
      span.setStatus({ code: opentelemetry.SpanStatusCode.ERROR });
      return response
        .status(403)
        .json({ error: "not authorized to delete this blog" });
    }
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { likes, title, url, author },
      { new: true }
    );
    span.setStatus({ code: opentelemetry.SpanStatusCode.OK });
    return response.json(updatedBlog);
  } finally {
    span.end();
  }
});

module.exports = blogRouter;
