const express   = require('express');
const jwt       = require('jsonwebtoken');
const fs        = require('fs');
const path      = require('path');
const bcrypt    = require('bcrypt');
const db        = require('./db')
const router    = express.Router();

router.get('/users', users);
router.post('/signin', sign_in);
router.post('/product/add', is_authorized, add);
router.post('/product/update', is_authorized, update);
router.post('/product/delete', is_authorized, destroy);
router.post('/product/get', is_authorized, get);
router.get('/product/list', is_authorized, list);
router.post('/product/attach', is_authorized, attach);
router.post('/product/remove', is_authorized, remove);
router.post('/product/owned', is_authorized, owned);
router.post('/product/upload', is_authorized, upload);

function is_authorized(req, res, next){
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        let pem_path = path.join(__dirname, 'private.pem');
        let pem = fs.readFileSync(pem_path, 'utf8');
        jwt.verify(token, pem, {algorithm: "HS256"}, (err, user) => {
            if(err){
                res.status(401).json({ error: "Not Authorized"});
                throw new Error("Not Authorized");
            }
            return next();
        });
    }
    else{
        res.status(401).json({ error: "Not Authorized"});
        throw new Error("Not Authorized")
    }
}
async function users(req, res){
    try {
        result = await db.query('select id, email, first_name, last_name from users');
        res.json({ success: true, users: result.rows });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function sign_in(req, res){
    let data;
    let pem;
    let token;
    let record;
    let match;

    try {
        data = req.body;
        if(!data ||  !data.hasOwnProperty('email') || !data.hasOwnProperty('password') )
            return res.status(401).json({"message": "Missing Login Credentials"});

        record = await db.query('select * from users where email = ($1)', [data.email]);
        if(!record.rows.length)
            return res.status(401).json({"message": "Invalid Login Credentials"});

        match = await bcrypt.compare(data.password, record.rows[0].password);
        if(!match) 
            return res.status(401).json({"message": "Invalid Login Credentials"});
        
        pem = fs.readFileSync(path.join(__dirname, 'private.pem'), 'utf8');
        token = jwt.sign({"user_id": record.rows[0].id }, pem, { algorithm: 'HS256', expiresIn: 3600});//valid for 1 hour
        res.json({ success: true, token: token, user_id: record.rows[0].id });
    } catch (error) {
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function add(req, res){
    let columns = ["name", "price", "description"];
    let data;
    let params;
    let query;
    let values;
    let result;

    try {
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })) 
            return res.status(400).json({"message": "Add Product - Missing Required Properties"});

        values = [data.name, data.price, data.description]
        if(data.hasOwnProperty('image')){
            columns.push('image');
            values.push(data.image);
        }
        params = columns.map((val, ndx) => `$${ndx + 1}`)
        query = `INSERT into products (${columns}) VALUES (${params.join(',')}) returning id`;
        result = await db.query(query, values);
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function update(req, res){
    let columns = ["product_id", "name", "price", "description"];
    let data;
    let params;
    let query;
    let values;
    let result;

    try {
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })) 
            return res.status(400).json({"message": "Update Product - Missing Required Properties"});

        values = [data.name, data.price, data.description]
        if(data.hasOwnProperty('image')){
            columns.push('image');
            values.push(data.image);
        }
        columns.shift()
        values.push(data.product_id);
        params = columns.map((val, ndx) => `${val}=($${ndx + 1})`)
        query = `UPDATE products SET ${params.join(',')} WHERE id = ($${columns.length + 1})`;
        result = await db.query(query, values);
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function destroy(req, res){
    let columns = ["product_id"];
    let data;
    
    try {
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })) 
            return res.status(400).json({"message": "Update Product - Missing Required Properties"});

        values = [data.product_id]
        await db.query(`DELETE from user_products where product_id = ($1)`, values);
        await db.query(`DELETE from products where id = ($1)`, values);
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function get(req, res){
    let columns = ["product_id"];
    let data;
    let result;
    let product;

    try {
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; }))
            return res.status(400).json({"message": "Get Product - Missing Required Properties" });

        values = [data.product_id]
        query = `SELECT * from products where id = ($1)`;
        result = await db.query(query, values);
        product = (result.rows.length) ? result.rows[0] : [];
        res.json({ success: true, product: product });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function list(req, res){
    try {
        result = await db.query('select * from products');
        res.json({ success: true, result: result.rows });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function attach(req, res){
    let columns = ["product_id"];
    let token = req.headers.authorization.split(" ")[1];
    let data;

    try {
        //retrieve and parse the user id
        token = jwt.decode(token);
        if(!token.hasOwnProperty('user_id'))
            throw Error("missing user id");

        //retrieve the product id
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })) 
            return res.status(400).json({"message": "Attach User Product - Missing Required Properties"});

        result = await db.query(`INSERT into user_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT (user_id, product_id) DO NOTHING returning product_id`, [token.user_id, data.product_id]);
        res.json({ success: true , product_id: result.rows[0], user_id: token.user_id });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function remove(req, res){
    let columns = ["product_id"];
    let token = req.headers.authorization.split(" ")[1];
    let data;

    try {
        //retrieve and parse the user id
        token = jwt.decode(token);
        if(!token.hasOwnProperty('user_id'))
            throw Error("missing user id");

        //retrieve the product id
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })) 
            return res.status(400).json({"message": "Remove User Product - Missing Required Properties"});

        result = await db.query(`DELETE from user_products where user_id = ($1) and product_id = ($2)`, [token.user_id, data.product_id]);
        res.json({ success: true });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function owned(req, res){
    let columns = ["user_id"];
    let data;
    let token = req.headers.authorization.split(" ")[1];
    let user_id;

    try {
        data = req.body;
        if (!data || !columns.every(function(x) { return x in data; })){
            token = jwt.decode(token);
            user_id = parseInt(token.user_id);
        }
        else{
            user_id = parseInt(data.user_id);
        }

        result = await db.query('select * from products p inner join user_products pr on pr.product_id = p.id where user_id = ($1)', [user_id]);
        res.json({ success: true, result: result.rows });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
async function upload(req, res){
    let columns = ["product_id"];
    let data;
    let product;
    let image_path;
    let full_path;

    try {
        data = req.body;

        if (!data || !columns.every(function(x) { return x in data; }))
            return res.status(400).json({"message": "Get Product - Missing Required Properties" });
        if(!req.files)
            return res.status(400).json({"status": false, "message": "Get Product - Missing Required Properties" });

        //Use the name of the input field (i.e. "product") to retrieve the uploaded file
        product = req.files.image;
        //client relative path
        image_path = `/products/${product.name}`;
        //full path to the image directory
        full_path = path.join(path.join(__dirname, `../../client/public/${image_path}`))
        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        product.mv(full_path);
        //update the product image in the db 
        values = [data.product_id, image_path]
        query = `UPDATE products SET image=($2) WHERE id = ($1)`;
        result = await db.query(query, values);
        //send response
        res.json({
            status: true,
            message: 'File is uploaded',
            data: {
                name: product.name,
                mimetype: product.mimetype,
                size: product.size
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({"message": "Invalid Request"});
    }
}
module.exports = router;