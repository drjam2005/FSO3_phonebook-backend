const mongoose = require('mongoose')
const args = process.argv

if (args.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = args[2]
const url = `mongodb+srv://drjam:${password}@cluster0.e2wn6lj.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(args.length === 3){
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(({ name, number }) => {
      console.log(`${name} ${number}`)
    })
    mongoose.connection.close()
  })
}

if(args.length === 5){
  const entry = new Person({
    name: args[3],
    number: args[4]
  })

  entry.save().then(({ name, number }) => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}
