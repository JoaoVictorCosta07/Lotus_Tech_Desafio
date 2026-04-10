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

router.get('/', async (req, res) => {
    try{
        const userId = req.user.id

        const userProjects = await prisma.project.findMany({
            where: {
                OR: [
                    { user_id: req.user.id },
                    { shared: true }
                ]
            }
        })


        if (userProjects.length === 0){
            return res.status(404).json({message:'Esse usuário não tem projetos ativos'})
        }

        return res.status(200).json(userProjects)
    } catch(err){
        console.log(err)
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

router.get('/:id', async (req, res) => {
    try{
        const {id} = req.params

        const foundProject = await prisma.project.findUnique({
            where: {id: id},
        })

        console.log(foundProject)
        console.log(req.user.id)
        console.log(foundProject.user_id)
        console.log(foundProject.shared)

        if(foundProject.shared === false && req.user.id != foundProject.user_id){
            return res.status(403).json({message: "Você não tem autorização de ver esse projeto"})
        }

        return res.status(200).json(foundProject)
        
    } catch(err){
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const {id} = req.params

        const foundProject = await prisma.project.findUnique({
            where: {
                id: id
            }
        })

        console.log(foundProject)

        if (!foundProject){
            return res.status(404).json({message: "Projeto não encontrado"})
        }

        if (req.user.id !== foundProject.user_id) {
            return res.status(403).json({ message: "Você não tem autorização para deletar esse projeto" })
        }

        await prisma.project.delete({
            where: { id: id }
        })

        return res.status(201).json({message: "Projeto deletado com sucesso"})
    } catch(err){
        return res.status(500).json({message: "Erro no servidor, tente novamente"})
    }
})

export default router
    
