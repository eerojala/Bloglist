const supertest = require('supertest')
const {app, server} = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, nonExistingId, blogsInDb, initialUsers } = require('./test_helper')

describe('When there are initially some blogs saved', async () => {
    beforeAll(async () => {
        await Blog.remove({})

        const blogObjects = initialBlogs.map(blog => new Blog(blog))
        const promiseArray = blogObjects.map(blog => blog.save())

        await Promise.all(promiseArray)
    })

    test('all blogs are returned as json by GET /api/blogs', async () => {
        const blogsInDatabase = await blogsInDb()
        
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-type', /application\/json/)

        const returnedTitles = response.body.map(blog => blog.title)
        blogsInDatabase.forEach(blog => {
            expect(returnedTitles).toContain(blog.title)
        })
    })

    describe('and the user is not logged in', async () => {
        test('posting a new blog by POST /api/blogs fails', async () => {
            const blogsBeforePost = await blogsInDb()

            const newBlog = {
                title: 'BlogTitle',
                author: 'BlogAuthor',
                url: 'http://blogurl.com',
                likes: 9
            }

            const response = await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)
                .expect('Content-type', /application\/json/)

            const blogsAfterPost = await blogsInDb()

            const titles = blogsAfterPost.map(blog => blog.title)

            expect(blogsAfterPost.length).toBe(blogsBeforePost.length)
            expect(blogsAfterPost).not.toContain(newBlog.title)
        })

        test('deleting a blog by DELETE /api/blog/:id fails', async () => {
            const newBlog = new Blog({
                title: 'Eltit',
                author: 'Rohtua',
                url: 'http://blog.cleancoder.com',
                likes: 1
            })

            await newBlog.save()
            const blogsBeforeDelete = await blogsInDb()

            await api
                .delete(`/api/blogs/${newBlog.id}`)
                .expect(401)

            const blogsAfterDelete = await blogsInDb()

            const titles = blogsAfterDelete.map(blog => blog.title)

            expect(titles).toContain(newBlog.title)
            expect(blogsAfterDelete.length).toBe(blogsBeforeDelete.length)
        })
    })

    describe('and the user is logged in', async () => {
        let token
                
        beforeAll(async () => {
            const user = {
                username: 'master',
                password: 'ysecret'
            }

            const response = await api
                .post('/api/login')
                .send(user)

            token = response.body.token
        })

        describe('addition of a new blog in POST /api/blogs', async () => {  
            test('succeeds with valid data', async () => {
                const blogsBeforePost = await blogsInDb()

                const newBlog = {
                    title: "Type wars",
                    author: "Robert C. Martin",
                    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
                    likes: 2
                }
    
                await api
                    .post('/api/blogs')
                    .set('Authorization', 'bearer ' + token)
                    .send(newBlog)
                    .expect(200)
                    .expect('Content-type', /application\/json/)
    
                const blogsAfterPost = await blogsInDb()
    
                expect(blogsAfterPost.length).toBe(blogsBeforePost.length + 1)
                expect(blogsBeforePost).not.toEqual(blogsAfterPost)
    
                const titles = blogsAfterPost.map(blog => blog.title)
                const authors = blogsAfterPost.map(blog => blog.author)
                const urls = blogsAfterPost.map(blog => blog.url)
                const likes = blogsAfterPost.map(blog => blog.likes)
    
                expect(titles).toContain(newBlog.title)
                expect(authors).toContain(newBlog.author)
                expect(urls).toContain(newBlog.url)
                expect(likes).toContain(newBlog.likes)
            })
    
            test('succeeds and is given 0 likes if no likes were initially given', async () => {
                const newBlog = {
                    title: "Canonical string reduction",
                    author: "Edsger W. Dijkstra",
                    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
                }
    
                const blogsBeforePost = await blogsInDb()
                const likesBeforePost = blogsBeforePost.map(blog => blog.likes)
    
                expect(likesBeforePost).not.toContain(0)
    
                await api
                    .post('/api/blogs')
                    .set('Authorization', 'bearer ' + token)
                    .send(newBlog)
                    .expect(200)
                    .expect('Content-type', /application\/json/)
    
                const blogsAfterPost = await blogsInDb()
                const urls = blogsAfterPost.map(blog => blog.url)
                const likesAfterPost = blogsAfterPost.map(blog => blog.likes)
    
                expect(urls).toContain('http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')
                expect(likesAfterPost).toContain(0)
            })
    
            test('fails if no title or url in new blog and returns HTTP 400 bad request', async () => {
                const newBlog = {
                    author: 'John Doe',
                    likes: 4
                }
    
                const blogsBeforePost = await blogsInDb()
                    
                await api
                    .post('/api/blogs')
                    .set('Authorization', 'bearer ' + token)
                    .send(newBlog)
                    .expect(400)
    
                const blogsAfterPost = await blogsInDb()
                expect(blogsAfterPost.length).toBe(blogsBeforePost.length)
            })
        })

        describe('deletion of a blog in DELETE /api/blogs/:id', async () => { 
            test('succeeds with proper status code', async () => {
                const addedBlog = new Blog({
                    title: 'First class tests',
                    author: 'Robert C Martin',
                    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
                    likes: 10,
                    user: '5a8706a9d7dd3a3058513a28'
                })

                await addedBlog.save()

                const blogsBeforeDelete = await blogsInDb()
    
                await api
                    .delete(`/api/blogs/${addedBlog.id}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(204)
    
                const blogsAfterDelete = await blogsInDb()
    
                const titles = blogsAfterDelete.map(blog => blog.title)
    
                expect(titles).not.toContain(addedBlog.title)
                expect(blogsAfterDelete.length).toBe(blogsBeforeDelete.length - 1)
            })

            test('fails if the blog doesnt belong to the logged in user', async () => {
                const addedBlog = new Blog({
                    title: '1',
                    author: '2',
                    url: '3',
                    likes: 18
                })

                await addedBlog.save()

                const blogsBeforeDelete = await blogsInDb()

                const response = await api
                    .delete(`/api/blogs/${addedBlog.id}`)
                    .set('Authorization', 'bearer ' + token)
                    .expect(400)

                const blogsAfterDelete = await blogsInDb()

                expect(response.body.error).toBe('Invalid user')
                expect(blogsAfterDelete.length).toBe(blogsBeforeDelete.length)
            })
    
            test('fails with malformatted id', async () => {
                const blogsBeforeDelete = await blogsInDb()
    
                const response = await api
                    .delete('/api/blogs/1')
                    .set('Authorization', 'bearer ' + token)
                    .expect(400)
    
                const blogsAfterDelete = await blogsInDb()
                
                expect(response.body.error).toEqual('Malformatted id')
                expect(blogsAfterDelete).toEqual(blogsBeforeDelete)
            })
        })
    
        describe('updating a blog in PUT /api/blogs/:id', async () => {
            let addedBlog
    
            beforeAll(async () => {
                addedBlog = new Blog({
                    title: 'TDD harms architecture',
                    author: 'Robert C martin',
                    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
                    likes: 11
                })
    
                await addedBlog.save()
            })
    
            test('succeeds with proper status code', async () => {
                const blogsBeforePut = await blogsInDb()
    
                const updatesToBlog = {
                    title: 'New Title',
                    author: 'New Author',
                    url: 'https://fullstack-hy.github.io/',
                    likes: 26
                }
                
                await api
                    .put(`/api/blogs/${addedBlog.id}`)
                    .send(updatesToBlog)
                    .expect(200)
                    .expect('Content-type', /application\/json/)
    
                const blogsAfterPut = await blogsInDb()
    
                const titles = blogsAfterPut.map(blog => blog.title)
                const likes = blogsAfterPut.map(blog => blog.likes)
    
                expect(blogsAfterPut.length).toBe(blogsBeforePut.length)
                expect(titles).toContain(updatesToBlog.title)
                expect(titles).not.toContain(addedBlog.title)
                expect(likes).toContain(updatesToBlog.likes)
                expect(likes).not.toContain(addedBlog.likes)
            })
    
            test('fails with malformatted id', async () => {
                const blogsBeforePut = await blogsInDb()
    
                const updatesToBlog = {
                    title: 'New Title2',
                    author: 'New Author2',
                    url: 'https://fullstack-hy.github.io/osa2',
                    likes: 22
                }
    
                await api
                    .put('/api/blogs/1')
                    .send(updatesToBlog)
                    .expect(400)
    
                const blogsAfterPut = await blogsInDb()
    
                expect(blogsAfterPut).toEqual(blogsBeforePut)
            })
        })
    })
    
    afterAll(() => {
        server.close()
    })
})