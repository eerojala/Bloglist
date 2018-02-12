const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }

    return blogs.reduce(reducer, 0)
}

const favouriteBlog = (blogs) => {
    if (Array.isArray(blogs) && blogs.length !== 0) {
        const reducer = (mostLiked, current) => {
            return (mostLiked.likes > current.likes) ? mostLiked : current
        }
    
        return blogs.reduce(reducer)
    }

    return null
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog
}