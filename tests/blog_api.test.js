const supertest = require('supertest')
const {app, server} = require('../index')
const api = supertest(app)
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

beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-type', /application\/json/)
})

test('all notes are returned', async () => {
    const response = await api
        .get('/api/blogs')

    expect(response.body.length).toBe(initialBlogs.length)
})

test('a specific blog is called React Patterns', async () => {
    const response = await api
        .get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(titles).toContain('React patterns')
})

test('a valid blog can be added', async () => {
    const newBlog = {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-type', /application\/json/)

    const response = await api
        .get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body.length).toBe(initialBlogs.length + 1)
    expect(titles).toContain('Type wars')
})

test('if no likes then default to 0', async () => {
    const newBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-type', /application\/json/)

    const response = await api
        .get('/api/blogs')

    const savedBlog = response.body[response.body.length-1]

    expect(savedBlog.title).toBe('Canonical string reduction')
    expect(savedBlog.author).toBe('Edsger W. Dijkstra')
    expect(savedBlog.url).toBe('http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')
    expect(response.body[response.body.length - 1].likes).toBe(0)
})

afterAll(() => {
    server.close()
})