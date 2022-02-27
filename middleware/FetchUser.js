const jwt = require('jsonwebtoken');

const jwt_key = "This is a secret key"

const fetchUser = (req, res, next) => {
    const token = req.header('jwt_token')
    if(!token){
        return res.status(401).json({error: 'Please authenticate using valid token'})
    }

    try{
        const data = jwt.verify(token, jwt_key)
        req.user = data.user
        next()
    }catch(error){
        return res.status(500).json({error: 'Please authenticate using valid token'})
    }

}

module.exports = fetchUser;