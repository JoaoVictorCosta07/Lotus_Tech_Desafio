import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import blacklist from '../blacklist.js'
import auth from '../middlewares/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos (nome, email e senha) são obrigatórios' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const userDB = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword
            }
        })

        res.status(201).json({ message: 'Usuário criado com sucesso', user: { id: userDB.id, name: userDB.name, email: userDB.email } })
    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(409).json({ message: 'Este e-mail já está cadastrado' })
        }
        res.status(500).json({ message: 'Erro ao cadastrar usuário, tente novamente mais tarde' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios" });
        }

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Senha incorreta" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

        res.status(200).json({ message: "Login realizado com sucesso", token });

    } catch (err) {
        res.status(500).json({ message: "Erro ao realizar login, tente novamente" });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization

        if (!token) {
            return res.status(400).json({ message: "Token não fornecido" });
        }

        blacklist.add(token);
        res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (err) {
        res.status(500).json({ message: "Erro ao processar logout" })
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
            return res.status(404).json({ message: "Perfil de usuário não encontrado" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar informações do perfil" });
    }
});

export default router