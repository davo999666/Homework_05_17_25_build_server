import express from "express";
import dotenv from "dotenv";
import {initDB, getDB} from './db.js';

dotenv.config()

const port = process.env.PORT || 3000
const app = express()
await initDB();

app.use(express.json())

app.use((req, res, next) => {
    req.db = getDB();
    next();
});

app.post('/todo', async (req, res) => {
    const {title, description} = req.body;
    if (!title || !description) {
        return res.status(400).type('text/plain; charset=utf-8').send('Title and description required');
    }
    await req.db.run(
        'INSERT INTO todos (title, description) VALUES (?, ?)',
        [title, description]
    );
    res.type('text/plain; charset=utf-8').send('ok')

});
app.get('/todo/:id', async (req, res) => {
    const id = req.params.id;
    const result = await req.db.get('SELECT * FROM todos WHERE id = ?', [id]);

    if (!result) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Not Found: ${id}`);
    }

    res.json(result);
});

app.delete('/todo/:id', async (req, res) => {
    const id = req.params.id;
    const result = await req.db.run('DELETE FROM todos WHERE id = ?', [id]);
    if (!result.changes) {
        return res.status(404).type('text/plain; charset=utf-8').send(`Not Found: ${id}`)
    }
    res.json(result);
})
app.get('/todos', async (req, res) => {
    const todos = await req.db.all('SELECT * FROM todos');
    res.json(todos);
});
app.put('/todo/:id', async (req, res) => {
    const id = Number(req.params.id);
    const {title, description} = req.body;
    if (!title || !description) {
        return res.status(400).type('text/plain; charset=utf-8').send('Title and description required');
    }
    await req.db.run(
        'UPDATE todos SET title = ?, description = ? WHERE id = ?',
        [title, description, id]);

    res.type('text/plain; charset=utf-8').send('ok')

})

//                                       Homework
app.put('/todo/change/row/name', async (req, res) => {
    const { oldname, newname } = req.body;
    if (!oldname || !newname) {
        return res.status(400).send(' Missing "oldname" or "newname" in body');
    }
    const columns = await req.db.all('PRAGMA table_info(todos)');
    const hasNameColumn = columns.some(col => col.name === oldname);

    if (!hasNameColumn) {
        return res.send(`Column "${oldname}" does not exist`);
    }
        await req.db.exec(`ALTER TABLE todos RENAME COLUMN ${oldname} TO ${newname}`);
        res.send(` Renamed column "${oldname}" to "${newname}"`);
});


app.put('/todo/add/name', async (req, res) => {
    const { nameRow } = req.body;
    if (!nameRow) {
        return res.status(400).send(' Missing "nameRow" in request body');
    }
    const columns = await req.db.all('PRAGMA table_info(todos)');
    const hasNameColumn = columns.some(col => col.name === 'nameRow');
    if (!hasNameColumn) {
        await req.db.exec('ALTER TABLE todos ADD COLUMN nameRow TEXT DEFAULT ""');
    }
    const result = await req.db.run('UPDATE todos SET nameRow = ?', [nameRow]);
    res.send(`nameRow "${nameRow}" set for ${result.changes} todos`);
});


app.get('/todos/filerId/odd', async (req, res) => {
    const todos = await req.db.all('SELECT * FROM todos WHERE id % 2 = 1');
    res.json(todos);
});

app.get('/todos/filerId/even', async (req, res) => {
    const todos = await req.db.all('SELECT * FROM todos WHERE id % 2 = 0');
    res.json(todos);
});

app.get('/todos/sort/title', async (req, res) => {
    const todos = await req.db.all('SELECT * FROM todos ORDER BY title COLLATE NOCASE ASC');
    res.json(todos);
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})