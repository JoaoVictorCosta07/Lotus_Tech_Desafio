import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.post('/register', async (req, res) => {
    try{
        const user = req.body

        const userDB = await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            }
        })

        res.status(201).json(userDB)
    } catch(err){
        console.log(err)
        res.status(500).json({message:'Tente novamente'})
    }
})

export default router
