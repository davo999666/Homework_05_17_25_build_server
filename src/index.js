import express from "express";
import dotenv from "dotenv";

dotenv.config()

const port = process.env.PORT || 3000
const app = express()

app.use(express.json())
const bd = [];
let counter = 0;
app.post('/todo', (req, res) => {
    const {title, description} = req.body;
    const todo = {
        id: counter++,
        title,
        description,
    }
    bd.push(todo);
    res.type('text/plain; charset=utf-8').send('ok')

});
app.get('/todo/:id', (req, res) => {
    const {id} = req.params.id;
    console.log(id);
    const result = bd.find(f => f.id === +id)
    if (!result) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Not Found: ${id}`)
    }
    res.json(result);
})

app.delete('/todo/:id', (req, res) => {
    const id = req.params.id;
    const index = bd.findIndex(f => f.id === +id)
    if (index === -1) {// TODO
        return res.status(404).type('text/plain; charset=utf-8').send(`Not Found: ${id}`)
    }
    bd.splice(index, 1);
    res.json(index);
})
app.get('/todos', (req, res) => {
    res.json(bd)
});
app.put('/todo/:id', (req, res) => {
    const id = req.params.id;
    const todo = bd.find(f => f.id === +id);
    if (!todo) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Not Found: ${id}`)
    }
    const body = req.body;
    todo.title = body.title
    todo.description = body.description;
    res.json(bd)

})


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})