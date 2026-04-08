import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) =>{
    const token = req.headers.authorization

    if (!token){
        res.status(401).json({message:"Acesso negado"})
    }

    try{
        const decoded = jwt.verify(token.replace('Bearer ',''), JWT_SECRET)

        req.userId = decoded.id

        next()
    } catch(err){
        res.status(401).json({message:"token inválido"})
    }
}

export default auth