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

const printToConsole = (printContents) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(printContents)
    }
}

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs.map(formatBlog))
})
  
 blogsRouter.post('/', async (request, response) => {
    try {
        const blog = new Blog(request.body)

        if (!blog.title || !blog.url) {
            return response.status(400).json({ error: 'Missing blog title and/or url' })
        }

        blog.likes ? blog.likes = blog.likes : blog.likes = 0
        printToConsole(blog)
    
        await blog.save()
        response.json(formatBlog)
    } catch (exception){
        printToConsole(exception)
        response.status(500).json({ error: 'Something went wrong...' })
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

        response.json(formatBlog(updatedBlog))
    } catch (exception) {
        printToConsole(exception)
        response.status(400).send({ error: 'Malformatted id' })
    }
})

  module.exports = blogsRouter