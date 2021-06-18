import express from 'express';
import cors from 'cors';

import connection from './database/database.js';
import userSchema from './dataValidation.js';

const server = express();
const PORT = 4000;

server.use(cors());
server.use(express.json());

//CATEGORIES
server.get('/categories', async (req, res) => {
    try {
        const categories = await connection.query(`
        SELECT * FROM categories;
        `);
        res.send(categories.rows);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        await connection.query(`
        INSERT INTO categories (name) VALUES ($1);
        `, [name]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})

//JOGOS
server.get('/games', async (req, res) => {
    try {
        const games = await connection.query(`
            SELECT games.*, categories.name AS "categoryName" 
            FROM games JOIN categories 
            ON games."categoryId" = categories.id;
        `);
        res.send(games.rows);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.post('/games', async (req, res) => {
    try {
        const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
        await connection.query(`
            INSERT INTO games 
            (name,image,"stockTotal","categoryId","pricePerDay") 
            VALUES ($1, $2, $3, $4, $5);
        `, [name,image,stockTotal,categoryId,pricePerDay]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
})


server.listen(PORT, () => console.log(`Server is successfully listening at PORT ${PORT}`));