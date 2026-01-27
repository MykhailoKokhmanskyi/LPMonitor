import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.ts';
import type { ErrorRequestHandler } from 'express';

//import authRoutes from './routes/auth.js';
//import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src/views'))

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "object-src": ["'none'"],
      "upgrade-insecure-requests": [],
    },
  },
}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.use('/auth', authRoutes)

const errorHandler: ErrorRequestHandler = (err,_req,res,_next) => {
	console.error("SERVER ERROR:", err.message)
	const status = err.status || 500;
	res.status(status).render('error')
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
