import express from 'express'

const router = express.Router()

//Rota de Cadastro | esperado: name, email, password
router.get('/users', async (req, res) => {
    try{
        res.status(200).json({message: "Logado com sucesso"})
    } catch(err){
        console.log(err)
        res.status(500).json({message:'Erro no servidor, tente novamente'})
    }
})

export default router