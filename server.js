const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000;
const file = 'products.json';

// Middlewre para intepretar las solicitudes en formato JSON
app.use(express.json())

// Levantar el servidor
app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`))


// Funciones para manipular archivos
const readFile = (file) => {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
};

const addProduct = (productCharge, file) => {
    const products = readFile(file);
    const newId = products.length === 0 ? 1 : products[products.length - 1].id + 1;
    const newProduct = {
        id: newId,
        ...productCharge
    };
    products.push(newProduct);
    fs.writeFileSync(file, JSON.stringify(products));
    console.log(`Producto agregado con éxito en el archivo: ${file}`);
};

const productById = (id, file) => {
    const products = readFile(file)
    const search = products.find(product => product.id === id)
    return search
}

const updateProduct = (updatedData, file, id) => {
    const products = readFile(file);
    const index = products.findIndex(p => p.id === id)

    if (index !== -1) {
        products[index] = {
            ...products[index],
            ...updatedData,
            id
        }
        fs.writeFileSync(file, JSON.stringify(products))
        return products[index]
    } else {
        console.log(`El producto con ID ${id} no existe.`)
    }
};

const deleteProduct = (file, id) => {
    const products = readFile(file);
    const exist = products.some(p => p.id === id)

    if (exist) {
        const productsFiltered = products.filter(p => p.id !== id)
        fs.writeFileSync(file, JSON.stringify(productsFiltered))
        return true
    } else {
        return false
    }
};

//Ruteo
app.get('/', (req, res) => {
    res
        .status(200)
        .json('API de prodcutos.')
});

app.get('/allproducts', (req, res) => {
    const data = readFile(file)
    res.
        status(200)
        .json({ title: 'Listado de productos', data: data })
})

app.post('/products', (req, res) => {
    const product = req.body;
    addProduct(product, file)
    res.
        status(201)
        .json({ title: 'Producto cargado con éxito', data: product })
})

app.get('/product/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const searchProduct = productById(id, file)
    if (searchProduct) {
        return res
            .status(200)
            .json(searchProduct)
    } else {
        return res
            .status(404)
            .json({ msg: 'Producto no encontrado.' })
    }
})

app.put('/product/update/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedData = req.body;

    const update = updateProduct(updatedData, file, id)

    if (update) {
        res
            .status(200)
            .json({ msg: 'Producto actualizado', data: update })
    } else {
        res
            .status(404)
            .json({ err: 'No se encontró el producto' })
    }
})

app.delete('/product/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filter = deleteProduct(file, id)

    if (filter) {
        res
            .status(200)
            .json({ msg: `El producto con ID ${id} fue eliminado` })
    } else {
        res
            .status(404)
            .json({ msg: 'Producto no encontrado.' })
    }
})





