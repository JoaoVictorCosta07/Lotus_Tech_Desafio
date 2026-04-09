import express from 'express'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import projectsRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'

import auth from './middlewares/auth.js'

const PORT = process.env.PORT
const app = express()
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users', auth, usersRoutes)
app.use('/projects', auth, projectsRoutes)
app.use('/tasks', auth, taskRoutes)

app.listen(PORT, () => console.log(`servidor rodando na porta ${PORT}`))