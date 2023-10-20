import { createRequire } from 'node:module'
import express from 'express'
import jwt from 'jsonwebtoken'
import db from './db/connection.js'
import Producto from './models/producto.js'
import Usuario from './models/usuario.js'

const require = createRequire(import.meta.url)
const datos = require('./datos.json')

const html = '<h1>Bienvenido a la API</h1><p>Los comandos disponibles son:</p><ul><li>GET: /productos/</li><li>GET: /productos/id</li>    <li>POST: /productos/</li>    <li>DELETE: /productos/id</li>    <li>PUT: /productos/id</li>    <li>PATCH: /productos/id</li>    <li>GET: /usuarios/</li>    <li>GET: /usuarios/id</li>    <li>POST: /usuarios/</li>    <li>DELETE: /usuarios/id</li>    <li>PUT: /usuarios/id</li>    <li>PATCH: /usuarios/id</li></ul>'

const app = express()

const exposedPort = 1234

app.use((req, res, next) => {
    if (req.method !== 'POST') {return next()}

    if (req.headers['content-type'] !== 'application/json') {return next()}

    let bodyTemp = ''
    req.on('data', chunk => {
        bodyTemp += chunk.toString()
    })

    req.on('end', () => {
        const data = JSON.parse(bodyTemp)
        req.body = data

        next()
    })
})

app.use((req, res, next) => {
    if (req.method !== 'PATCH') {return next()}

    if (req.headers['content-type'] !== 'application/json') {return next()}

    let bodyTemp = ''
    req.on('data', chunk => {
        bodyTemp += chunk.toString()
    })

    req.on('end', () => {
        const data = JSON.parse(bodyTemp)
        req.body = data

        next()
    })
})

app.get('/', (req, res) => {    
    res.status(200).send(html)
})

// Endpoint para la autenticación de usuarios
app.post('/auth', async (req, res ) => {
    
    //Obtención de los datos del body de la request
    const usuarioABuscar = req.body.usuario
    const passwordRecibido = req.body.password

    let usuarioEncontrado = ''

    try {
        usuarioEncontrado = await Usuario.findAll({where:{usuario:usuarioABuscar}})
    } catch (error) {
        return res.status(400).json({message: 'Usuario no encontrado'})
    }

    // Comprobacion del password
    if (usuarioEncontrado[0].password !== passwordRecibido){
        return res.status(400).json({message: 'Password incorrecto'})
    }

    // Generacion del token
    const sub = usuarioEncontrado[0].id
    const usuario = usuarioEncontrado[0].usuario
    const nivel = usuarioEncontrado[0].nivel

    // Firma y construccion del token
    const token = jwt.sign({
        sub,
        usuario,
        nivel,
        exp: Date.now() + (60 * 1000)
    }, process.env.SECRET_KEY)

    res.status(200).json({ accessToken: token })

})

app.get('/productos/', async (req, res) =>{
    try {
        let allProducts = await Producto.findAll()

        res.status(200).json(allProducts)
    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/productos/total', (req, res) => {
    try {
        let totalStock = datos.productos.reduce((total, producto) => total + producto.stock, 0)
        let totalPrecio = datos.productos.reduce((total, producto) => total + producto.precio, 0)

        res.status(200).json({'total_stock': totalStock, 'total_precio': totalPrecio})

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/usuarios/', async (req, res) =>{
    try {
        let allUsers = await Usuario.findAll()

        res.status(200).json(allUsers)

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/productos/:id', async (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = await Producto.findByPk(productoId)

        res.status(200).json(productoEncontrado)

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/productos/:id/precio', async (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = await Producto.findByPk(productoId)

        if (!productoEncontrado){
            res.status(204).json({'message':'Producto no encontrado'})
        }

        res.status(200).json({'precio': productoEncontrado.precio})

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/productos/:id/nombre', (req, res) => {
    try {
        let productoId = parseInt(req.params.id)
        let productoEncontrado = datos.productos.find((producto) => producto.id === productoId)

        if (!productoEncontrado){
            res.status(204).json({'message':'Producto no encontrado'})
        }

        res.status(200).json({'nombre': productoEncontrado.nombre})

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/usuarios/:id', async (req, res) => {
    try {
        let usuarioId = parseInt(req.params.id)
        let usuarioEncontrado = await Usuario.findByPk(usuarioId)

        res.status(200).json(usuarioEncontrado)

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/usuarios/:id/telefono', (req, res) => {
    try {
        let usuarioId = parseInt(req.params.id)
        let usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId)

        if (!usuarioEncontrado){
            res.status(204).json({'message':'Usuario no encontrado'})
        }

        res.status(200).json({'telefono': usuarioEncontrado.telefono})

    } catch (error) {
        res.status(204).json({'message': error})
    }
})

app.get('/usuarios/:id/nombre', (req, res) => {
    try {
        let usuarioId = parseInt(req.params.id)
        let usuarioEncontrado = datos.usuarios.find((usuario) => usuario.id === usuarioId)

        if (!usuarioEncontrado){
            res.status(204).json({'message':'Usuario no encontrado'})
        }

        res.status(200).json({'nombre': usuarioEncontrado.nombre})

    } catch (error) {
        res.status(204).json({'message': error})
    }
})


app.post('/productos', async (req, res) => {
    try {
            //datos.productos.push(req.body)
            const productoAGuardar = new Producto(req.body)
            await productoAGuardar.save()        
    
        res.status(201).json({'message': 'success'})

    } catch (error) {
        res.status(204).json({'message': 'error'})
    }
})

app.post('/usuarios', async (req, res) => {
    try {
            //datos.usuarios.push(req.body)
            const usuarioAGuardar = new Usuario(req.body)
            await usuarioAGuardar.save()
    
        res.status(201).json({'message': 'success'})

    } catch (error) {
        res.status(204).json({'message': 'error'})
    }
})

app.patch('/productos/:id', async (req, res) => {
    let idProductoAEditar = parseInt(req.params.id)
    try {
        let productoAActualizar = await Producto.findByPk(idProductoAEditar)

        if (!productoAActualizar) {
            return res.status(204).json({'message':'Producto no encontrado'})}
        
            await productoAActualizar.update(req.body)

            res.status(200).send('Producto actualizado')
        
    
    } catch (error) {
        res.status(204).json({'message':'Producto no encontrado'})
    }
})

app.patch('/usuarios/:id', async (req, res) => {
    let idUsuarioAEditar = parseInt(req.params.id)
    try {
        let usuarioAActualizar = await Usuario.findByPk(idUsuarioAEditar)

        if (!usuarioAActualizar) {
            return res.status(204).json({'message':'Usuario no encontrado.'})
        }

            await usuarioAActualizar.update(req.body)

            res.status(200).send('Usuario actualizado.')
        
    } catch (error) {
        res.status(204).json({'message':'Usuario no encontrado.'})
    }
})

app.delete('/productos/:id', async (req, res) => {
    let idProductoABorrar = parseInt(req.params.id)
    try {
        let productoABorrar = await Producto.findByPk(idProductoABorrar)
        if (!productoABorrar){
            return res.status(204).json({'message':'Producto no encontrado'})
    }

        await productoABorrar.destroy()
        res.status(200).json({messahe: 'Producto borrado.'})

    } catch (error) {
        res.status(204).json({'message': 'error'})
    }
})

app.delete('/usuarios/:id', async (req, res) => {
    let idUsuarioABorrar = parseInt(req.params.id)
    try {
        let usuarioABorrar = await Usuario.findByPk(idUsuarioABorrar)

    if (!usuarioABorrar){
        return res.status(204).json({'message':'Usuario no encontrado'})
    }

    await usuarioABorrar.destroy()
    res.status(200).json({message: 'Usuario borrado.'})

    } catch (error) {
        res.status(204).json({'message': 'error'})
    }
})

app.use((req, res) => {
    res.status(404).send('<h1>404</h1>')
})

try {
    await db.authenticate()
    console.log('Conexion con la DDBB establecida.')
} catch (error) {
    console.error('Error de conexion db', error)
}

app.listen( exposedPort, () => {
    console.log('Servidor escuchando en http://localhost:' + exposedPort)
})
