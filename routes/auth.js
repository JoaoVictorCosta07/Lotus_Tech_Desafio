import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import blacklist from '../blacklist.js'
import auth from '../middlewares/auth.js'

const prisma = new PrismaClient
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

//Rota de Cadastro | esperado: name, email, password
router.post('/register', async (req, res) => {
    try{
        const user = req.body

        if (!user){
            res.status(401).json({message:'Requisição inválida'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(user.password,salt)

        const userDB = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: hashPassword
            }
        })

        res.status(201).json(userDB)
    } catch(err){
        res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

//Rota de Login | esperado: email, password
router.post('/login', async (req, res) => {
    try {
        const userInfo = req.body;

        const user = await prisma.user.findUnique({
            where: { email: userInfo.email }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const isMatch = await bcrypt.compare(userInfo.password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Senha inválida" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json(token);

    } catch (err) {
        res.status(500).json({ message: "Erro no servidor, tente novamente" });
    }
});

router.post('/logout', async(req,res) => {
    try{
        const token = req.headers.authorization

        if (token) {
            blacklist.add(token);
        }
        res.status(200).json({ message: "Logout realizado" });
    } catch(err){
        res.status(500).json({message:"Erro no servidor, tente novamente"})
    }

})

router.get('/me', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { 
                id: true,
                name: true,
                email: true

            }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Erro no servidor" });
    }
});

export default router
