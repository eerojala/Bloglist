const Blog = require('../models/blog')

const initialBlogs = [
    {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
    },
    {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
    }
]

const nonExistingId = async () => {
    const blog = new Blog()
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(Blog.format)
}

const User = require('../models/user')

const initialUsers = [
    {
        username: 'eerojala',
        name: 'Eero Ojala',
        adult: true,
        password: 'salasana'
    },
    {
        username: 'apina',
        name: 'Matti Meikäläinen',
        adult: false,
        password: 'secret'
    }
]

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(User.format)
}

module.exports = {
    initialBlogs, nonExistingId, blogsInDb, initialUsers, usersInDb
}