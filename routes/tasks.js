import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const task = req.body

        if (!task || Object.keys(task).length === 0) {
            return res.status(400).json({ message: 'Você não enviou uma tarefa' })
        }

        const foundProject = await prisma.project.findUnique({
            where: { id: task.project_id }
        })

        if (!foundProject) {
            return res.status(404).json({ message: 'Projeto não encontrado' })
        }

        // Bloqueia se o projeto não é shared E o usuário não é o dono
        if (foundProject.shared === false && foundProject.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Você não tem permissões de criar tarefas para esse projeto' })
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

    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.get('/', async (req, res) => {
    try {
        const { status, priority, project_id, due_date } = req.query

        const userProjects = await prisma.project.findMany({
            where: { user_id: req.user.id }
        })

        if (userProjects.length === 0) {
            return res.status(404).json({ message: 'Nenhum projeto encontrado para esse usuário' })
        }

        const projectIds = userProjects.map(project => project.id)

        const filters = {
            project_id: { in: projectIds }
        }

        if (status) {
            filters.status = status
        }

        if (priority) {
            filters.priority = priority
        }

        if (due_date) {
            filters.due_date = {
                lte: new Date(due_date)
            }
        }

        const tasks = await prisma.task.findMany({
            where: filters
        })

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Nenhuma tarefa encontrada' })
        }

        return res.status(200).json(tasks)

    } catch(err) {
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const foundTask = await prisma.task.findUnique({
            where: { id: id }
        })

        if (!foundTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' })
        }

        const taskProject = await prisma.project.findUnique({
            where: { id: foundTask.project_id }
        })

        if (taskProject.shared === false && req.user.id !== taskProject.user_id) {
            return res.status(403).json({ message: 'Você não tem autorização de ver essa tarefa' })
        }

        return res.status(200).json(foundTask)

    } catch(err) {
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const newTask = req.body

        const foundTask = await prisma.task.findUnique({
            where: { id: id }
        })

        if (!foundTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' })
        }

        const taskProject = await prisma.project.findUnique({
            where: { id: foundTask.project_id }
        })

        if (req.user.id !== taskProject.user_id) {
            return res.status(403).json({ message: 'Você não tem autorização para editar essa tarefa' })
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: {
                project_id: newTask.project_id,
                title: newTask.title,
                description: newTask.description,
                status: newTask.status,
                priority: newTask.priority,
                due_date: newTask.due_date
            }
        })

        return res.status(200).json(updatedTask)

    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params
        const newTask = req.body

        const foundTask = await prisma.task.findUnique({
            where: { id: id }
        })

        if (!foundTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' })
        }

        const taskProject = await prisma.project.findUnique({
            where: { id: foundTask.project_id }
        })

        if (req.user.id !== taskProject.user_id) {
            return res.status(403).json({ message: 'Você não tem autorização para editar essa tarefa' })
        }

        const updatedTask = await prisma.task.update({
            where: { id: id },
            data: { status: newTask.status }
        })

        return res.status(200).json(updatedTask)

    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const foundTask = await prisma.task.findUnique({
            where: { id: id }
        })

        if (!foundTask) {
            return res.status(404).json({ message: 'Tarefa não encontrada' })
        }

        const taskProject = await prisma.project.findUnique({
            where: { id: foundTask.project_id }
        })

        if (req.user.id !== taskProject.user_id) {
            return res.status(403).json({ message: 'Você não tem autorização para deletar essa tarefa' })
        }

        await prisma.task.delete({
            where: { id: id }
        })

        return res.status(200).json({ message: 'Tarefa deletada com sucesso' })

    } catch(err) {
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

export default router