
/////*****************1ST Method ************//////////////

export const asyncHandler = (requestHandler) => (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
}

/////*****************2nd Method ************//////////////

export const asyncHandlerr = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (error) {
        res.status(error.code || 400).json({
            success: false,
            message: error.message
        })
    }
}