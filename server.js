import express from 'express'
import publicRoutes from './routes/public.js'
import privateRoutes from './routes/private.js'

import auth from './middlewares/auth.js'

const PORT = 3000
const app = express()
app.use(express.json())

app.use('/auth', publicRoutes)
app.use('/', auth, privateRoutes)

app.listen(PORT, () => console.log(`servidor rodando na porta ${PORT}`))