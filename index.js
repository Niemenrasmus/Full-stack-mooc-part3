const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')


morgan.token('person', (req, res) => {
  console.log(req.method)
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})

let persons = [
    {
      name: "Arto Hellas", 
      number: "040-123456",
      id: 1
    },
    { 
      name: "Ada Lovelace", 
      number: "39-44-5323523",
      id: 2
    },
    { 
      name: "Dan Abramov", 
      number: "12-43-234345",
      id: 3
    },
    { 
      name: "Mary Poppendieck", 
      number: "39-23-6423122",
      id: 4
    }
  ]

persons_len = Object.keys(persons).length

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person',
  ),
)

app.get("/", (request, response) => {
  response.send("<h1>Terve<h1>")
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/info", (req, res) => {
  res.send(`Phonebook has info about ${persons_len} persons 
  <br/>
  ${new Date()}`)
})

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  }
  else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: "Name is required"
  })
  }

  if (!body.number) {
    return response.status(400).json({
      error: "Number is required"
  })
  }

  if (JSON.stringify(persons).includes(body.name)) {
    return response.status(400).json({ 
      error: "Name is already in the phonebook"
  })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000) + 1,
  }

  persons = persons.concat(person)

  response.json(person)
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
  
