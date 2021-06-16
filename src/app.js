import express from 'express';
import cors from 'cors';
import Joi from 'joi';

const app = express;
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => console.log(`server successfully listening at PORT ${PORT}`));
