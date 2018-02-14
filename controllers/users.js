const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const printToConsole = require('../utils/controller_helper')

usersRouter.post('/', async (request, response) => {
    try {
        const body = request.body

        const salt = bcryptjs.genSaltSync(10)
        const passwordHash = await bcryptjs.hashSync(body.password, salt)

        const user = new User({
            username: body.username,
            name: body.name,
            passwordHash,
            adult: body.adult
        })

        const savedUser = await user.save()

        response.json(User.format(savedUser))
    } catch (exception) {
        printToConsole(exception)
        response.status(500).json({ error: 'Something went wrong...' })
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users.map(user => User.format(user)))
})

module.exports = usersRouter