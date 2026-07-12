require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person.js')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
morgan.token('body', (req) => { return JSON.stringify(req.body)})
morgan.token('time', () => { return new Date().toISOString() })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :time :body'))

app.get('/', (request, response) => {
  response.send(' <h1> Hello, World!  </h1> ')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if(!person)
        response.status(404).end()
      else
        response.json(person).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if(!request.body){
    response.status(400).json({
      error: 'must have request body!'
    }).end()
  }

  if(!name || !number){
    return response.status(400).json({
      error: 'must have name and number!',
    }).end()
  }

  const newPerson = new Person({
    name: name,
    number: number
  })

  newPerson.save().then(savedPerson => {
    return response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  const id = request.params.id


  if(!name || !number){
    return response.status(400).json({
      error: 'must have name and number!',
    }).end()
  }

  Person.findById(id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save()
    })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      }
    })
    .catch(error => next(error))
})


app.get('/info', (request, response) => {
  Person.find({}).then(people => {
    response.send(`
			<div>
				Phonebook has info for ${people.length} people
				<br/>
				${(new Date()).toString()}
			</div>
		`)
  })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformed id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response, next) => {
  response.status(404).send({ error: 'unknown endpoint' })
  next()
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
