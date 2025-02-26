import express, { Request, Response } from 'express';
const webRoutes = express.Router();

webRoutes.get('/', (req: Request, res: Response) => {
	res.setHeader('Content-Type', 'text/html');
	res.write(`<h1>WELCOME TO AURORA BACKEND<h1>`);

	setTimeout(() => {
		res.end();
	}, 1000);
});

export default webRoutes;