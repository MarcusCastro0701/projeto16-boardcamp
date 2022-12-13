import { connectionDB } from "../database/db.js"
import joi from "joi"

const customerSchema = joi.object({
    name: joi.string().required(),
    phone: joi.string().required().min(10).max(11),
    cpf: joi.string().required().min(11).max(11),
    birthday: joi.date().required()
})

export async function createCustomer(req, res){

    const body = req.body;

    const validation = customerSchema.validate(body, { abortEarly: true });

    if(validation.error){
        const errors = validation.error.details.map(details => details.message)
        console.log(errors);
        res.sendStatus(400);
        return
    }

    const verificaCPF = await connectionDB.query(`SELECT * FROM customers WHERE  cpf='${body.cpf}';`);
    if(verificaCPF.rows.length !== 0){
        console.log("este cpf ja foi cadastrado");
        res.sendStatus(409);
        return
    }

    try {

        await connectionDB.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`, 
        [body.name, body.phone, body.cpf, body.birthday]);
        console.log("Cliente inserido")
        res.sendStatus(200);

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return
    }

}

export async function getCustomers(req, res) {

    const cpf = req.query.cpf;

    try {

        if (cpf) {
            const cpfFiltrado = await connectionDB.query(`SELECT * FROM customers WHERE cpf LIKE '%${cpf};'`);
            res.send(cpfFiltrado.rows);
            return
        }
    
        const todosCpf = await connectionDB.query("SELECT * FROM customers;");
        res.send(todosCpf.rows);
        return
        
    } catch (error) {
        
        console.log(error, "deu erro no try/catch getCustomers");
        res.sendStatus(500);
        return

    }

    

}

export async function getCustomersById(req, res){

    const id = req.params.id;

    const verificaCustomer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [id]);
    
    if(verificaCustomer.rows.length === 0){
        console.log("CPF nao encontrado em getCustomersById");
        res.sendStatus(404);
        return
    }

    res.send(verificaCustomer.rows[0]);
    return

}

export async function setCustomer(req, res){

    const id = req.params.id;

    const { cpf } = req.body;

    const body = req.body;
    

    const validation = customerSchema.validate(body, { abortEarly: true });
    if(validation.error){
        const errors = validation.error.details.map(details => details.message)
        console.log(errors);
        res.sendStatus(400);
        return
    }

    const verificaCustomer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [id]);
    if(verificaCustomer.rows.length === 0){
        console.log("CPF nao encontrado em setCustomer");
        res.sendStatus(404);
        return
    }

    try {
       
        if(verificaCustomer.rows[0].cpf === cpf.toString()){
            await connectionDB.query("UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;", 
            [body.name, body.phone, body.cpf, body.birthday, id]);
            console.log('usuario atualizado');
            res.sendStatus(200);
            return
        }

        const verificaCPF = await connectionDB.query("SELECT * FROM customers WHERE cpf=$1;", [cpf]);
        console.log(verificaCPF.rows, cpf)
        if(verificaCPF.rows.length !== 0){
            
            console.log('nao pode ser feito o put-customers')
            res.sendStatus(409);
            return
        }
        await connectionDB.query("UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;", [body.name, body.phone, body.cpf, body.birthday, id]);
            console.log('usuario atualizado');
            res.sendStatus(200);
            return

    } catch (error) {
        console.log(error, "erro no try/catch no setCustomer");
        res.sendStatus(409);
        return
    }

    


    


}