import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.get('/', async (req, res) => {
    try{
        const users = await prisma.user.findMany()

        res.status(200).json(users)
    } catch(err){
        console.log(err)
        res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

router.get('/:id', async (req, res) => {
    try{
        const {id} = req.params

        const user = await prisma.user.findUnique({
            where: {id: id}
        })

        if(!user){
            return res.status(404).json({message: "Usuário não encontrado"})
        }

        res.status(200).json(user)
        
    } catch(err){
        res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})
