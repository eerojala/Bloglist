const supertest = require('supertest')
const {app, server} = require('../index')
const api = supertest(app)
const User = require('../models/user')
const { initialUsers, usersInDb } = require('../tests/test_helper')

describe('When there are initially some users saved', async () => {
    beforeAll(async () => {
        await User.remove({ username : initialUsers[0].username })
        await User.remove({ username : initialUsers[1].username })
        await User.remove({ username: 'mluukkai' })
        await User.remove({ username: 'rotta' })

        const userObjects = initialUsers.map(user => new User(user))
        const promiseArray = userObjects.map(user => user.save())
        
        await Promise.all(promiseArray)
    })

    describe('addition of a new user in POST /api/users', async () => {
        test('succeeds with valid data', async() => {
            const usersBeforePost = await usersInDb()

            const newUser = {
                username: 'mluukkai',
                name: 'Matti Luukkainen',
                adult: true,
                password: 'salainen'
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-type', /application\/json/)

            const usersAfterPost = await usersInDb()

            const usernames = usersAfterPost.map(user => user.username)
            const names = usersAfterPost.map(user => user.name)

            expect(usersAfterPost.length).toBe(usersBeforePost.length + 1)
            expect(usernames).toContain(newUser.username)
            expect(names).toContain(newUser.name)
        })

        test('succeeds and defaults to adult if no adult paramter was given', async () => {
            const usersBeforePost = await usersInDb()

            const newUser = {
                username: 'rotta',
                name: 'Aku Ankka',
                password: 'salis'
            }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-type', /application\/json/)

            const usersAfterPost = await usersInDb()

            const savedUser = await User.findById(response.body.id)
            
            expect(usersAfterPost.length).toBe(usersBeforePost.length + 1)
            expect(savedUser.adult).toEqual(true)
        })

        test('fails if username is not unique', async () => {
            const usersBeforePost = await usersInDb()

            const newUser = {
                username: 'eerojala',
                name: 'Not Eero Ojala',
                password: 'asdfg'
            }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-type', /application\/json/)

            const usersAfterPost = await usersInDb()

            expect(response.body.error).toBe('Username must be unique')
            expect(usersAfterPost.length).toBe(usersBeforePost.length)
        })

        test('fails if user username is too short', async () => {
            const usersBeforePost = await usersInDb()

            const newUser = {
                username: 'JD',
                name: 'John Doe',
                password: 'a1355ad'
            }

            const response = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-type', /application\/json/)

            const usersAfterPost = await usersInDb()

            expect(response.body.error).toBe('Username must be atleast 3 characters')
            expect(usersAfterPost.length).toBe(usersBeforePost.length)
        })
    })

    afterAll(() => {
        server.close()
    })
})