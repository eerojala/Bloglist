const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const printToConsole = require('../utils/controller_helper')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { _id: 1, username: 1, name: 1 })

    response.json(blogs.map(Blog.format))
})
  
 blogsRouter.post('/', async (request, response) => {
    try {
        const body = request.body
        const token = request.token
        const decodedToken = jwt.verify(token, process.env.SECRET)

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'Token missing or invalid' })
        }

        const user = await User.findById(decodedToken.id)

        const blog = new Blog(request.body)
        blog.user = user

        if (!blog.title || !blog.url) {
            return response.status(400).json({ error: 'Missing blog title and/or url' })
        }

        blog.likes ? blog.likes = blog.likes : blog.likes = 0
        printToConsole(blog)
    
        const savedBlog = await blog.save()

        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.json(Blog.format(blog))
    } catch (exception){
        if (exception.name === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message })
        } else {
            printToConsole(exception)
            response.status(500).json({ error: 'Something went wrong...' })
        }
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    try {
        await Blog.findByIdAndRemove(request.params.id)

        response.status(204).end()
    } catch (exception) {
        printToConsole(exception)
        response.status(400).send({ error: 'Malformatted id' })
    }
})

blogsRouter.put('/:id', async (request, response) => {
    try {
        const body = request.body

        const blog = {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes
        }

        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new : true })

        response.json(Blog.format(updatedBlog))
    } catch (exception) {
        printToConsole(exception)
        response.status(400).send({ error: 'Malformatted id' })
    }
})

  module.exports = blogsRouter