import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.post('/', async (req, res) => {
    try{
        const project = req.body
        console.log(project)

        if (!project){
            return res.status(401).json({message:'Requisição inválida'})
        }

        const newProject = await prisma.project.create({
            data: {
                user_id: req.user.id,
                name: project.name,
                description: project.description,
                shared: project.shared,
                deadline: project.deadline
            }
        })

        return res.status(201).json(newProject)
        
    } catch(err){
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

export default router
    
