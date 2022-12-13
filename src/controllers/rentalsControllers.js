import { connectionDB } from "../database/db.js"
import joi from "joi"
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const rentalSchema = joi.object({
    customerId: joi.number().required(),
    gameId: joi.number().required(),
    rentDate: joi.date().required(),
    daysRented: joi.number().required(),
    returnDate: joi.valid(null).required(),
    originalPrice: joi.number().min(0.0001).required(),
    delayFee: joi.valid(null).required()
})


export async function createRental(req, res){

    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    const { customerId, gameId, daysRented } = req.body;

    const verificaCliente = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [customerId]);
    if(verificaCliente.rows.length === 0){
        console.log('Cliente não encontrado em createRental');
        res.sendStatus(400);
        return
    }

    const verificaJogo = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [gameId]);
    if(verificaJogo.rows.length === 0){
        console.log("Jogo não encontrado em createRental");
        res.sendStatus(400);
        return
    }

    const valorJogo = verificaJogo.rows[0].pricePerDay;
    const estoqueJogo = verificaJogo.rows[0].stockTotal;
    const originalPrice = (daysRented * valorJogo);
    const descontaRental = estoqueJogo - 1;
    console.log(valorJogo, estoqueJogo, originalPrice, descontaRental, "line 43")

    if(estoqueJogo <= 0){
        console.log("nao há aluguéis disponíveis para este jogo");
        res.sendStatus(400);
        return;
    }

    if(daysRented <= 0){
        console.log("Dias alugados é menor ou igual a 0 em createRental");
        res.sendStatus(400);
        return
    }

    const bodyRental = {
        customerId: customerId,
        gameId: gameId,
        rentDate: today,
        daysRented: daysRented,
        returnDate: null,
        originalPrice: (daysRented * valorJogo),
        delayFee: null
    }
    console.log(bodyRental);

    const validation = rentalSchema.validate(bodyRental, { abortEarly: true });
    if(validation.error){
        const errors = validation.error.details.map(details => details.message)
        console.log(errors);
        res.sendStatus(400);
        return
    }

    try {
        
        

        await connectionDB.query('UPDATE games SET "stockTotal"=$1 WHERE id=$2;', [descontaRental, gameId])

        await connectionDB.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [customerId, gameId, today, daysRented, null, originalPrice, null]);
        console.log("novo aluguel inserido");
        res.sendStatus(200);
        return

    } catch (error) {
        console.log(error);
        res.send(error);
        return
    }



}

export async function getRentals(req, res) {

    const {customerId, gameId} = req.params;

    let arrNewRentals = [];

    async function  newRentalsFunction(obj) {
        const customer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [obj.customerId]);
        const game = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [obj.gameId]);
        const categorie = await connectionDB.query("SELECT * FROM categories WHERE id=$1;", [game.rows[0].categoryId])

        const newBody = {

            id: obj.id,
            customerId: obj.customerId,
            gameId: obj.gameId,
            rentDate: obj.rentDate,
            daysRented: obj.daysRented,
            returnDate: obj.returnDate,
            originalPrice: obj.originalPrice,
            delayFee: obj.delayFee,
            customer: {
                id: customer.rows[0].id,
                name: customer.rows[0].name
            },
            game: {
                id: game.rows[0].id,
                name: game.rows[0].name,
                categoryId: game.rows[0].categoryId,
                categoryName: categorie.rows[0].name
            }

        }
        

        arrNewRentals.push(newBody) 
        console.log(arrNewRentals)
        
        
    }

    try {

        

        if (customerId) {
            console.log("chegou no if customerId")
            const rentalsByCustomerId = await connectionDB.query(`SELECT * FROM rentals WHERE "customerId" LIKE '%${customerId}%';`)
            rentalsByCustomerId.rows.map(obj => newRentalsFunction(obj))
            res.sendStatus(200)
            return;
        }

        if (gameId){
            console.log("chegou no if gameId")
            const rentalsByGameId = await connectionDB.query(`SELECT * FROM rentals WHERE "customerId" LIKE '%${gameId}%';`)
            rentalsByGameId.rows.map(obj => newRentalsFunction(obj))
            res.sendStatus(200)
            return;
        }

        
        const rentals = await connectionDB.query("SELECT * FROM rentals;")
        rentals.rows.map(obj => (newRentalsFunction(obj)))
        console.log(arrNewRentals, "aqui")
        res.send(arrNewRentals)
        return


        
        
        


    } catch (error) {

        console.log(error, "erro no try/catch de getRentals");
        res.sendStatus(500);
        return        

    }
    
    



}