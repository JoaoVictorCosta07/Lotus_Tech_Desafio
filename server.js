import express from 'express'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'

import auth from './middlewares/auth.js'

const PORT = 3000
const app = express()
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/users', auth, usersRoutes)

app.listen(PORT, () => console.log(`servidor rodando na porta ${PORT}`))