import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient
const router = express.Router()

router.post('/', async (req, res) => {
    try{

        return res.status(200).json({message: "funcionado"})
        
    } catch(err){
        return res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

export default router
    
