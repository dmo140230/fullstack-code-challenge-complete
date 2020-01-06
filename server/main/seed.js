const fs        = require('fs');
const path      = require('path');
const bcrypt    = require('bcrypt');
const db        = require('./db')
const users     = require('./users');

let _seed = async function(){
    let schema = false;
    let existing = [];

    let init = async function(){
        try {
            await load_schema();
            await db.query(schema);
            await get_existing_users();
            await seed_users();
        } catch (error) {
            console.log(error);
        }
        return;
    }
    let load_schema = async function(){
        return new Promise((resolve, reject) => {
            sql_file = fs.readFile(path.join(__dirname, 'schema.sql'), 'utf-8', function(err, result){
                if(err) return reject(err);
                schema = result;
                return resolve();
            });
        });
    }
    let get_existing_users = async function(){
        try {
            let result = await db.query('select email from users');
            if(!result.rows.length)
                return;
            for(let user of result.rows){
                existing.push(user.email);
            }
        } catch (error) {
            throw Error(error);
        }
    }
    let seed_users = async function(){
        try {
            let params = [];
            let values = [];
            let counter = 1;

            for(let user of users){
                if(existing.includes(user.email))
                    continue;

                user.password = await hash_password(user.password);
                let data = Object.values(user);
                let params_array = [];
                for(let item of data){
                    params_array.push(`$${counter}`);
                    counter = counter + 1;
                }
                params.push(` (${params_array.join(',')})`);
                values = values.concat(data);
            }
            if(values.length) await db.query(`INSERT INTO users (email, first_name, last_name, password) VALUES ${params.join(',')} `, values);
        } catch (error) {
            throw Error(error);
        }
        return;
    }
    let hash_password = async function(password){
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, function(err, hash) {
                if(err) reject(err);
                return resolve(hash);
            });
        });
    }

    await init();
}

module.exports =  _seed;