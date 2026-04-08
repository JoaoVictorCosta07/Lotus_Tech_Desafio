import express from 'express'
import publicRoutes from './routes/public.js'


const PORT = 3000
const app = express()
app.use(express.json())

app.use('/auth', publicRoutes)

app.listen(PORT, () => console.log(`servidor rodando na porta ${PORT}`))