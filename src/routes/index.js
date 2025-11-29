import { Router } from "express";
import productController from '../controllers/productsController.js';
import reportsController from '../controllers/reportsController.js';  // Importa el controlador de reportes que contiene la lógica de negocio para reportes
import {methods as authentication} from '../controllers/authenticationController.js';
import {methods as auth} from '../middlewares/authorization.js';
import {methods as notify} from '../controllers/notificacionesController.js';


const router = new Router();
// Configuración de EJS, es decir las rutas de las vistas
router.get('/', (req, res) => res.redirect("/login"));
router.get('/login', auth.isLogged,(req, res) => res.render('login',{title: 'Login'}));
router.get('/home',auth.loggedOnly, auth.verificarSesion,(req, res) => res.render('index', {title: 'Pagina de Inicio', user: req.user} ));
router.get('/about',auth.loggedOnly, (req, res) => res.render('about', {title: 'About Page'}));
router.get('/atencion',auth.loggedOnly, auth.verificarSesion, (req, res) => res.render('atention'));
// RUTAS DEL CRUD
//router.get('/editar', (req,res) => res.render('editar', {title: 'Editar medicamento'}));
router.get('/inventario', auth.loggedOnly, auth.verificarSesion , productController.list);
router.post('/create', auth.loggedOnly, productController.create);
router.get('/delete/:id', auth.loggedOnly,productController.delete);
router.get('/editar/:id', auth.loggedOnly,auth.verificarSesion, productController.edit);
router.post('/update/:id', auth.loggedOnly,productController.update);

// RUTAS DE REPORTES
router.get('/reportes', auth.loggedOnly, auth.verificarSesion, (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Connection error:', err);
            return res.render('reportes', {title: 'Reportes', reports: [], user: req.user});
        }
        conn.query('CALL SHOW_REPORTS()', (queryErr, results) => {
            if (queryErr) {
                console.error('Query error:', queryErr);
                return res.render('reportes', {title: 'Reportes', reports: [], user: req.user});
            }
            res.render('reportes', {title: 'Reportes', reports: results[0] || [], user: req.user});
        });
    });
});
router.post('/api/reports/generate-pdf', auth.loggedOnly, reportsController.generatePDF);
router.post('/api/reports/generate-excel', auth.loggedOnly, reportsController.generateExcel);
router.get('/api/reports/download/:id', auth.loggedOnly, reportsController.downloadReport);


// Rutas para productos

//API
router.post('/api/register', auth.adminOnly, authentication.register);
router.post('/api/login', authentication.login);
router.post('/api/logout', authentication.logout);
// API NOTIFICACIONES
router.get('/api/getNotifications', auth.verificarSesion, notify.getNotifications);

//API ATENCION
router.post('/api/addproductcart/:id/:quantity', auth.verificarSesion, productController.addProductCart);
router.post('/api/deleteProductCart/:id', auth.verificarSesion, productController.deleteProductCart);
router.get('/api/search', auth.verificarSesion, productController.search);
router.get('/api/getCart', auth.verificarSesion, productController.getCart);
router.post('/api/resetCart', auth.verificarSesion, productController.resetProductsCart);
router.post('/api/finalizar-atencion', auth.verificarSesion, productController.finalizarAtencion);
export default router;
