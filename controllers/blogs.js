const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const formatBlog = (blog) => {
    return {
        id: blog._id,
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes
    }
}

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs.map(formatBlog))
  })
  
 blogsRouter.post('/', async (request, response) => {
    try {
        const blog = new Blog(request.body)
        blog.likes ? blog.likes = blog.likes : blog.likes = 0
        console.log(blog)
    
        await blog.save()
        response.json(formatBlog)
    } catch (exception){
        console.log(exception)
        response.status(500).json({error: 'something went wrong...'})
    }
  })

  module.exports = blogsRouter