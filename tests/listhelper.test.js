const listHelper = require('../utils/list_helper')

test('dummy is called', () => {
    const blogs = []
    expect(listHelper.dummy(blogs)).toBe(1)
})