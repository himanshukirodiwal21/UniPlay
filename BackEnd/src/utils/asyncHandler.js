// for async function and await

const asyncHandler = (requestlHandler) =>{
    return (req, res, next) => {
        Promise.resolve(requestlHandler(req, res, next)).catch((err) => next(err))
    }
}




export {asyncHandler}
