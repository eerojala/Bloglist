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
    const reducer = (mostLiked, current) => {
        return (mostLiked.likes > current.likes) ? mostLiked : current
    }
    
    return blogs.reduce(reducer)
}

const mostBlogs = (blogs) => {
    const blogDictionary = {}
    const mostBlogsWritten = {
        author: '',
        blogs: 0
    }   

    blogs.forEach(blog => {
        const author = blog.author
        let blogsSoFar

        blogDictionary[author] ? blogsSoFar = blogDictionary[author] + 1 : blogsSoFar = 1

        blogDictionary[author] = blogsSoFar
        
       if (blogsSoFar > mostBlogsWritten.blogs) {
           mostBlogsWritten.author = author
           mostBlogsWritten.blogs = blogsSoFar
       }
    })

    return mostBlogsWritten
}

const mostLikes = (blogs) => {
    const blogDictionary = {}
    const mostLikedBlogger = {
        author: '',
        likes: 0
    }   

    blogs.forEach(blog => {
        const author = blog.author
        const likes = blog.likes
        let likesSoFar

        blogDictionary[author] ? likesSoFar = blogDictionary[author] + likes : likesSoFar = likes
        
        blogDictionary[author] = likesSoFar

        if (likesSoFar > mostLikedBlogger.likes) {
            mostLikedBlogger.author = author
            mostLikedBlogger.likes = likesSoFar
        } 
    })

    return mostLikedBlogger
}

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes
}