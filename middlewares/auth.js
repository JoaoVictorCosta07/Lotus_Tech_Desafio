import jwt from 'jsonwebtoken'
import blacklist from '../blacklist.js'

const JWT_SECRET = process.env.JWT_SECRET

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: "Acesso negado" });
    }


    if (blacklist.has(token)) {
        return res.status(401).json({ message: "Token inválido (logout realizado)" });
    }

    try {

        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        console.log(decoded)

        req.user = decoded; 

        next(); 
    } catch (err) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}

export default auth