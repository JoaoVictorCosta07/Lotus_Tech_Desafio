import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.get('/', async (req, res) => {
    try{
        const users = await prisma.user.findMany({
            select: {
                name: true,
                email: true
            }
        })

        return res.status(200).json(users)
    } catch(err){
        console.log(err)
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
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

        return res.status(200).json(user)
        
    } catch(err){
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params

        const deletedUser = await prisma.user.delete({
            where: {
                id: id
            }
        })

        if (!deletedUser){
            res.status(404).json({message: "Usuário não encontrado"})
        }

        console.log (deletedUser)
        return res.status(201).json({message: "Usuário deletado com sucesso!"})
    } catch(err){
        return res.status(500).json({message: "Erro no servidor, tente novamente"})
    }
})

router.put('/:id', async (req, res) => {
    try{
        const {id} = req.params
        const newUser = req.body

        const updateUser = await prisma.user.update({
            where: {id: id},
            data: {
                name: newUser.name,
                email: newUser.email
            }
        })

        
        res.status(201).json(updateUser)
    } catch(err){
        return res.status(500).json({message: "Erro no servidor, tente novamente"})
    }
})

export default router