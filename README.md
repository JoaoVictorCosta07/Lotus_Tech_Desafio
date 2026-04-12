# Lotus Tech Desafio — API REST de Gerenciamento de Projetos

API REST para gerenciamento de projetos e tarefas, desenvolvida como desafio técnico do processo seletivo 2026.1 da Lotus Tech.

## Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Banco de dados:** MongoDB Atlas
- **ORM:** Prisma v5
- **Autenticação:** JWT (jsonwebtoken)
- **Hash de senha:** bcrypt

**Justificativa:** Node.js com Express foi escolhido pela familiaridade com JavaScript no backend e pela facilidade de criação de APIs REST. O MongoDB foi escolhido pela flexibilidade do modelo de documentos e pela integração simples com o Prisma como ORM. O Prisma oferece tipagem, migrations e uma interface de queries intuitiva.

---

## Pré-requisitos

- Node.js v18 ou superior
- npm
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster criado

---

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/JoaoVictorCosta07/Lotus_Tech_Desafio.git
cd Lotus_Tech_Desafio
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/nome_do_banco"
JWT_SECRET="sua_chave_secreta"
PORT=3000
```

4. Sincronize o schema com o banco de dados:

```bash
npx prisma db push
npx prisma generate
```

5. Inicie o servidor:

```bash
# Produção
npm start

# Desenvolvimento (com hot reload)
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

---

## Rotas da API

### Autenticação — `/auth`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastro de usuário | ❌ |
| POST | `/auth/login` | Login e retorno do JWT | ❌ |
| POST | `/auth/logout` | Invalida o token | ✅ |
| GET | `/auth/me` | Dados do usuário autenticado | ✅ |

### Usuários — `/users`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/users` | Listar todos os usuários | ✅ |
| GET | `/users/:id` | Buscar usuário por ID | ✅ |
| PUT | `/users/:id` | Atualizar dados do usuário | ✅ |
| DELETE | `/users/:id` | Remover usuário | ✅ |

### Projetos — `/projects`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/projects` | Criar projeto | ✅ |
| GET | `/projects` | Listar projetos do usuário autenticado | ✅ |
| GET | `/projects/:id` | Buscar projeto por ID | ✅ |
| PUT | `/projects/:id` | Atualizar projeto | ✅ |
| DELETE | `/projects/:id` | Deletar projeto | ✅ |
| GET | `/projects/:id/tasks` | Listar tarefas do projeto | ✅ |
| GET | `/projects/:id/summary` | Contagem de tarefas por status | ✅ |

### Tarefas — `/tasks`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/tasks` | Criar tarefa vinculada a um projeto | ✅ |
| GET | `/tasks` | Listar tarefas do usuário autenticado | ✅ |
| GET | `/tasks/:id` | Buscar tarefa por ID | ✅ |
| PUT | `/tasks/:id` | Atualizar tarefa completa | ✅ |
| PATCH | `/tasks/:id/status` | Atualizar apenas o status | ✅ |
| DELETE | `/tasks/:id` | Deletar tarefa | ✅ |

#### Filtros disponíveis em `GET /tasks`

```
?status=pending|in_progress|done
?priority=low|medium|high
?project_id=uuid
?due_date=YYYY-MM-DD  →  tarefas com prazo até esta data
```

---

## Autenticação

As rotas protegidas requerem o token JWT no header da requisição:

```
Authorization: Bearer <token>
```

O token é retornado no login e expira em **1 dia**.

---

## Projetos Compartilhados

Projetos com `shared: true` podem ser visualizados por qualquer usuário autenticado, mas apenas o dono pode editar, criar tarefas ou deletar o projeto.

Projetos com `shared: false` são privados — apenas o dono tem acesso.

---

## Exemplo de Requisições

### Cadastro

```json
POST /auth/register
{
  "name": "João Victor",
  "email": "joao@email.com",
  "password": "senha123"
}
```

### Criar Projeto

```json
POST /projects
{
  "name": "Meu Projeto",
  "description": "Descrição do projeto",
  "shared": false,
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

### Criar Tarefa

```json
POST /tasks
{
  "project_id": "67f5a2b3c1234567890abcde",
  "title": "Criar tela de login",
  "description": "Desenvolver a interface de login",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-12-31T23:59:59.000Z"
}
```

### Exemplo de Summary

```json
GET /projects/:id/summary

{
  "total": 10,
  "pending": 4,
  "in_progress": 3,
  "done": 3
}
```
