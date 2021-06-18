import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br.js';
import { createRequire } from 'module';


import connection from './database/database.js';
import userSchema from './dataValidation.js';

const server = express();
const PORT = 4000;

server.use(cors());
server.use(express.json());

const now = dayjs().locale('pt-br').format('YYYY-MM-DD');

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

        const names = await connection.query(`SELECT categories.name FROM categories;`);
        console.log(names);
        const nameCheck = names.rows.find(n => name === n.name);

        if(nameCheck){
            res.sendStatus(409);
            return
        } else if (name.trim().lenght === 0){
            res.sendStatus(400);
            return
        } 
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

//GAMES
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
        `, [name, image, stockTotal, categoryId, pricePerDay]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

//CUSTOMERS
server.get('/customers', async (req, res) => {
    try {
        const customers = await connection.query(`
            SELECT * FROM customers;
        `);
        res.send(customers.rows);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.get('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id
        const customers = await connection.query(`
            SELECT * FROM customers WHERE customers.id = $1;
        `,[id]);
        res.send(customers.rows);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.post('/customers', async (req, res) => {
    try {
        const { name, phone, cpf, birthday } = req.body;
        await connection.query(`
            INSERT INTO customers 
            (name, phone, cpf, birthday) 
            VALUES ($1, $2, $3, $4);
        `, [name, phone, cpf, birthday]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.put('/customers/:id', async (req, res) => {
    try {
        const id = req.params.id
        const { name, phone, cpf, birthday } = req.body;
        await connection.query(`
            UPDATE customers SET 
            name = $2, phone = $3, cpf = $4, birthday = $5
            WHERE customers.id = $1;
        `, [id, name, phone, cpf, birthday]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

//RENTALS
server.get('/rentals', async (req, res) => {
    try {
        const rentals = await connection.query(`
        SELECT rentals.*,
        customers.name AS "customerName",
        games.name AS "gameName", games."categoryId",
        categories.name AS "categoryName"
        FROM rentals
        JOIN customers
        ON rentals."customerId" = customers.id
        JOIN games
        ON rentals."gameId" = games.id
        JOIN categories
        ON games."categoryId" = categories.id`);

        res.send(rentals.rows.map(r => {
            return {
                id: r.id,
                customerId: r.customerId,
                gameId: r.gameId,
                rentDate: r.rentDate,
                daysRented: r.daysRented,
                returnDate: r.returnDate, // troca pra uma data quando já devolvido
                originalPrice: r.originalPrice,
                delayFee: r.delayFee,
                customer: {
                    id: r.customerId,
                    name: r.customerName
                    },
                game: {
                    id: r.gameId,
                    name: r.gameName,
                    categoryId: r.categoryId,
                    categoryName: r.categoryName
                    }
            }
        }))
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.post('/rentals', async (req, res) => {
    try {
        const { customerId, gameId, daysRented } = req.body;

        const pricePerDay = await connection.query(`
        SELECT games."pricePerDay" 
        FROM games WHERE games.id = $1
        `, [gameId]);

        const numberOfDays = parseInt(daysRented)*10;
        const originalPrice = numberOfDays*pricePerDay.rows[0].pricePerDay;

        await connection.query(`
            INSERT INTO rentals 
            ("customerId", "gameId", "daysRented", "rentDate", "originalPrice") 
            VALUES ($1, $2, $3, $4, $5);
        `, [customerId, gameId, daysRented, now, originalPrice]);
        res.sendStatus(201);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.post('/rentals/:id', async (req, res) => {
    try {
        const id = req.params.id
        const rentals = await connection.query(`
            SELECT * FROM rentals WHERE rentals.id = $1;
        `,[id]);
        res.send(rentals.rows);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.delete('/rentals/:id', async (req, res) => {
    try {
        const id = req.params.id
        await connection.query(`DELETE FROM rentals WHERE rentals.id = $1`, [id]);
        res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
    }
});

server.listen(PORT, () => console.log(`Server is successfully listening at PORT ${PORT}`));
