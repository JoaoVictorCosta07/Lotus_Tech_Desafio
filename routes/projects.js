import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.post('/', async (req, res) => {
    try {
        const { name, description, shared, deadline } = req.body

        if (!name || !deadline  || !me || !description) {
            return res.status(400).json({ message: 'Os campos nome, descrição, compartilhado e prazo (deadline) são obrigatórios' })
        }

        const newProject = await prisma.project.create({
            data: {
                user_id: req.user.id,
                name,
                description,
                shared: shared || false,
                deadline: new Date(deadline)
            }
        })

        return res.status(201).json(newProject)
        
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao criar projeto, verifique os dados e tente novamente' })
    }
})

router.get('/', async (req, res) => {
    try {
        const userProjects = await prisma.project.findMany({
            where: {
                OR: [
                    { user_id: req.user.id },
                    { shared: true }
                ]
            }
        })

        if (userProjects.length === 0) {
            return res.status(404).json({ message: 'Nenhum projeto encontrado para este usuário' })
        }

        return res.status(200).json(userProjects)
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao buscar projetos no servidor' })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const foundProject = await prisma.project.findUnique({
            where: { id: id },
        })

        if (!foundProject) {
            return res.status(404).json({ message: "Projeto não localizado" })
        }

        if (foundProject.shared === false && req.user.id !== foundProject.user_id) {
            return res.status(403).json({ message: "Acesso negado: este projeto é privado" })
        }

        return res.status(200).json(foundProject)
        
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao processar a requisição do projeto' })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const newProject = req.body

        if (!newProject || Object.keys(newProject).length === 0) {
            return res.status(400).json({ message: 'Requisição inválida, envie os dados para atualizar' })
        }

        const foundProject = await prisma.project.findUnique({
            where: { id: id }
        })

        if (!foundProject) {
            return res.status(404).json({ message: 'Projeto não encontrado' })
        }

        // ProjectProject não existe — era foundProject
        if (req.user.id !== foundProject.user_id) {
            return res.status(403).json({ message: 'Você não tem autorização para editar esse projeto' })
        }

        const updatedProject = await prisma.project.update({
            where: { id: id },
            data: {
                name: newProject.name,
                description: newProject.description,
                shared: newProject.shared,
                deadline: new Date(newProject.deadline) // deadline vem do body
            }
        })

        return res.status(200).json(updatedProject)

    } catch(err) {
        return res.status(500).json({ message: 'Erro no servidor, tente novamente' })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params

        const foundProject = await prisma.project.findUnique({
            where: { id: id }
        })

        if (!foundProject) {
            return res.status(404).json({ message: "Impossível deletar: projeto não encontrado" })
        }

        if (req.user.id !== foundProject.user_id) {
            return res.status(403).json({ message: "Permissão insuficiente para excluir este projeto" })
        }

        await prisma.project.delete({
            where: { id: id }
        })

        return res.status(200).json({ message: "Projeto removido com sucesso" })
    } catch (err) {
        return res.status(500).json({ message: "Erro interno ao tentar excluir o projeto" })
    }
})

router.get('/:id/tasks', async (req, res) => {
    try {
        const { id } = req.params

        const foundProject = await prisma.project.findUnique({
            where: { id: id },
        })

        if (!foundProject) {
            return res.status(404).json({ message: "Projeto não localizado" })
        }

        if (foundProject.shared === false && req.user.id !== foundProject.user_id) {
            return res.status(403).json({ message: "Acesso negado: este projeto é privado" })
        }

        const foundTasks = await prisma.task.findMany({
            where: {project_id: foundProject.id}
        })

        if (foundTasks.length === 0) {
            return res.status(404).json({ message: 'Nenhuma tarefa encontrada para esse projeto' })
        }

        return res.status(200).json(foundTasks)
        
    } catch (err) {
        return res.status(500).json({ message: 'Erro ao processar a requisição do projeto' })
    }
})

export default router