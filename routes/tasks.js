import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.post('/', async (req, res) => {
    try{
        const task = req.body

        if (!task){
            return res.status(400).json({message:'Você não enviou uma tarefa'})
        }
        const foundProject = await prisma.project.findUnique({
            where:{
                id: task.project_id
            }
        })
        
        if (!foundProject){
            return res.status(404).json({message:'Projeto não encontrado'})
        }

        if (foundProject.user_id != req.user.id && foundProject.shared == false){
            return res.status(403).json({message:'Você não tem permissões de criar tarefas para esse projeto'})
        }

        const newTask = await prisma.task.create({
            data: {
                project_id: task.project_id,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                due_date: task.due_date
            }
        })

        return res.status(201).json(newTask)
        
    } catch(err){
        console.log(err)
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

router.get('/', async (req, res) => {
    try {
        const userProjects = await prisma.project.findMany({
            where: {
                user_id: req.user.id
            }
        })

        if (userProjects.length === 0) {
            return res.status(404).json({ message: 'Nenhum projeto encontrado para esse usuário' })
        }

        const projectIds = userProjects.map(project => project.id)

        const tasks = await prisma.task.findMany({
            where: {
                project_id: { in: projectIds }
            }
        })

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Nenhuma tarefa encontrada' })
        }

        return res.status(200).json(tasks)

    } catch(err) {
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

export default router