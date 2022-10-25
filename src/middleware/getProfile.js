
const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models')
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) return res.status(401).end()
    req.profile = profile
    next()
}

const isAuthorized = (authLevel) => {
    return async (req, res, next) => {
        if(req.profile.type !== authLevel) return res.status(501).end()
        next()
    }
}
module.exports = {
    getProfile,
    isAuthorized
}