import express from 'express';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';
import indexRoutes from './routes/index.js';
import myConnection from 'express-myconnection';
import dotenv from 'dotenv/config';
import mysql from 'mysql2';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import cookieParser from 'cookie-parser';
import toastr from 'express-toastr';


const app = express();

//SETTINGS
const __dirname = dirname(fileURLToPath(import.meta.url));
// Mostrar la diferencia entre las dos formas de concatenar rutas
// console.log(__dirname, '/views');
// console.log(join(__dirname, 'views'));
//==========================================
// CONFIGURACIÓN DE EJS
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
// Carpeta de archivos estaticos
app.use(express.static(join(__dirname, 'public')));
//==========================================
// CONFIGURACIÓN DE SESSION Y FLASH
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRET_SESSION, // debe estar en tu .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // true si usas HTTPS
}));

//==========================================
// BASE DE DATOS
app.use(myConnection(mysql, {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: Number(process.env.MYSQL_PORT),
    database: process.env.MYSQL_DATABASE
}, 'single'));

//==========================================
//app.use(morgan('dev'));
app.use(flash());
app.use((req, res, next) => {
    if (!req.session.carrito) req.session.carrito = [];
    next();
});
//=========================================
// DEFODIFICADOR DE BODY

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ENRUTADOR
app.use(indexRoutes);
app.listen(3000);
console.log("Server is running on http://localhost:3000");