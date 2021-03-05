const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

require('dotenv').config()

const Person = require('./models/person')
const cors = require('cors')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log("---")
  next();
};

morgan.token('person', (req, res) => {
  console.log(req.method)
  if (req.method === 'POST') return JSON.stringify(req.body)
  return null
})
app.use(express.static('build'))
app.use(express.json())
app.use(bodyParser.json())
app.use(requestLogger)
app.use(cors())

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :person',
  ),
)

app.get("/", (request, response) => {
  response.send("<h1>Terve<h1>")
})

app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()));
  })
})

app.get("/info", (req, res) => {
  const date = new Date();
  Person.find({}).then(persons => {
    persons.map(person => person.toJSON());
    response.send(
      `<p>Puhelinluettelossa ${persons.length} henkilön tiedot</p>` + date
    )
  })
})


app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
  .then(person => {
  if (person) {
    res.json(person.toJSON())
  }
  else {
    res.status(404).end()
  }
})
    .catch(e => next(e));
})

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number
  };

  Person.findByIdAndUpdate(request.params.id, person, 
    {new:true})
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON());
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(e => next(e))
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


  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 100000) + 1,
  });

  person
    .save()
    .then(savedNote => savedNote.toJSON())
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => {
      return response.status(400).json({
      error: "name already exists"
    })
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

app.use(errorHandler)

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
