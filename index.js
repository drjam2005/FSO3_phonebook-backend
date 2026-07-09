require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person.js');
const app = express();

app.use(express.json());
app.use(express.static('dist'));
morgan.token('body', (req) => { return JSON.stringify(req.body)});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get('/', (request, response) => {
	response.send('hi');
});

app.get('/api/persons', (request, response) => {
	Person.find({}).then(people => {
		response.json(people);
	});
});

app.get('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	Person.findById(id).then(person => {
		response.json(person).exit();
	}).catch(error => {
		response.status(404).json({error: `${error}`}).end();
	})
});

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	Person.findByIdAndDelete(id).then(res => {
		response.status(204).end();
	}).catch(error => {
		response.status(404).json({error: `${error}`}).end();
	});
})

app.post('/api/persons', (request, response) => {
	const body = request.body;

	if(!body){
		response.status(400).json({
			error: "must have request body!"
		}).end();
	}

	const personName = body.name;
	const personNumber = body.number;

	if(!personName || !personNumber){
		return response.status(400).json({
			error: "must have name and number!",
		}).end();
	}

	const newPerson = new Person({
		name: personName,
		number: personNumber
	});

	newPerson.save().then(() => {
		return response.json(newPerson);
	}).catch(error => {
		return response.status(404).send({
			error: 'unknown endpoint'
		});
	});
});


app.get('/info', (request, response) => {
	Person.find({}).then(people => {
		response.send(`
			<div>
				Phonebook has info for ${people.length} people
				<br/>
				${(new Date()).toString()}
			</div>
		`);
	});
});

const unknownEndpoint = (request, response, next) => {
	response.status(404).send({error: 'unknown endpoint'});
	next();
}

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
