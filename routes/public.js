import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import blacklist from '../blacklist.js'

const prisma = new PrismaClient
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

//Rota de Cadastro | esperado: name, email, password
router.post('/register', async (req, res) => {
    try{
        const user = req.body

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
        console.log(err)
        res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

//Rota de Login | esperado: email, password
router.post('/login', async (req, res) => {
    try{
        const userInfo = req.body

        const user = await prisma.user.findUnique({
            where: {email: userInfo.email}
        })

        const isMatch = await bcrypt.compare(userInfo.password, user.password)
        if (!isMatch){
            res.status(400).json({message:"Senha inválida"})
        }

        const token = jwt.sign({id: user.id}, JWT_SECRET, {expiresIn: "1d"})

        res.status(200).json(token)

    } catch(err){
        res.status(500).json({message:"Erro no servidor, tente novamente"})
    }
})

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

export default router
