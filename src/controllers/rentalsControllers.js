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

    if(descontaRental < 0){
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

    const {customerId, gameId} = req.query;
    
    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    let arrNewRentals = [];

    try {

        

        if (customerId) {
            const rentalsByCustomerId = await connectionDB.query(`SELECT * FROM rentals WHERE "customerId"=$1;`, [customerId])
            if(rentalsByCustomerId.rows.length === 0){
                res.sendStatus(400);
                return
            }
            for (let c = 0; c < rentalsByCustomerId.rows.length; c++) {

                const customer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [rentalsByCustomerId.rows[c].customerId]);
                const game = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [rentalsByCustomerId.rows[c].gameId]);
                const categorie = await connectionDB.query("SELECT * FROM categories WHERE id=$1;", [game.rows[0].categoryId])
    
                const newBody = {
    
                    id: rentalsByCustomerId.rows[c].id,
                    customerId: rentalsByCustomerId.rows[c].customerId,
                    gameId: rentalsByCustomerId.rows[c].gameId,
                    rentDate: rentalsByCustomerId.rows[c].rentDate,
                    daysRented: rentalsByCustomerId.rows[c].daysRented,
                    returnDate: rentalsByCustomerId.rows[c].returnDate,
                    originalPrice: rentalsByCustomerId.rows[c].originalPrice,
                    delayFee: rentalsByCustomerId.rows[c].delayFee,
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
                
    
                if (c === (rentalsByCustomerId.rows.length - 1)) {
                    res.send(arrNewRentals);
                    return
                }
            }
        }

        if (gameId){
            const rentalsByGameId = await connectionDB.query(`SELECT * FROM rentals WHERE "gameId"=$1;`, [gameId])
            if(rentalsByGameId.rows.length === 0){
                res.sendStatus(400);
                return
            }
            for (let c = 0; c < rentalsByGameId.rows.length; c++) {

                const customer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [rentalsByGameId.rows[c].customerId]);
                const game = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [rentalsByGameId.rows[c].gameId]);
                const categorie = await connectionDB.query("SELECT * FROM categories WHERE id=$1;", [game.rows[0].categoryId])
    
                const newBody = {
    
                    id: rentalsByGameId.rows[c].id,
                    customerId: rentalsByGameId.rows[c].customerId,
                    gameId: rentalsByGameId.rows[c].gameId,
                    rentDate: rentalsByGameId.rows[c].rentDate,
                    daysRented: rentalsByGameId.rows[c].daysRented,
                    returnDate: rentalsByGameId.rows[c].returnDate,
                    originalPrice: rentalsByGameId.rows[c].originalPrice,
                    delayFee: rentalsByGameId.rows[c].delayFee,
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
                
    
                if (c === (rentalsByGameId.rows.length - 1)) {
                    res.send(arrNewRentals);
                    return
                }
            }
            
        }

        
        const rentals = await connectionDB.query("SELECT * FROM rentals;")
        for (let c = 0; c < rentals.rows.length; c++) {

            const customer = await connectionDB.query("SELECT * FROM customers WHERE id=$1;", [rentals.rows[c].customerId]);
            const game = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [rentals.rows[c].gameId]);
            const categorie = await connectionDB.query("SELECT * FROM categories WHERE id=$1;", [game.rows[0].categoryId])

            const newBody = {

                id: rentals.rows[c].id,
                customerId: rentals.rows[c].customerId,
                gameId: rentals.rows[c].gameId,
                rentDate: rentals.rows[c].rentDate,
                daysRented: rentals.rows[c].daysRented,
                returnDate: rentals.rows[c].returnDate,
                originalPrice: rentals.rows[c].originalPrice,
                delayFee: rentals.rows[c].delayFee,
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

            if (c === (rentals.rows.length - 1)) {
                console.log(today)
                res.send(arrNewRentals);
                return
            }
        }
        
        


    } catch (error) {

        console.log(error, "erro no try/catch de getRentals");
        res.sendStatus(500);
        return        

    }
    
    



}

export async function endRental(req, res){

    const { id } = req.params

    let today = dayjs().locale('pt-br').format('YYYY-MM-DD');

    const rental = await connectionDB.query("SELECT * FROM rentals WHERE id=$1;", [id]);
    if(rental.rows.length === 0){
        console.log("id não encontrado em endRental")
        res.sendStatus(404);
        return;
    }
    if(rental.rows[0].returnDate !== null){
        console.log("rental ja finalizado")
        res.sendStatus(404);
        return;
    }
    console.log(rental.rows[0].returnDate, rental.rows.length)
    
    const prazo = rental.rows[0].daysRented;
    
    const dataAlugado = rental.rows[0].rentDate.toLocaleDateString().split("/");
    const mesesAlugado = dataAlugado[1];
    const diasAlugado = dataAlugado[0];
    const totalAlugado = (mesesAlugado * 30) + diasAlugado;

    const timeElapsed = Date.now();
    const returnDate = new Date(timeElapsed).toLocaleDateString().split("/");
    const diasDevolucao = returnDate[0];
    const mesesDevolucao = returnDate[1];
    const totalDevolucao = (mesesDevolucao*30) + diasDevolucao;

    const diferenca = totalDevolucao - totalAlugado;
    
    const jogo = await connectionDB.query("SELECT * FROM games WHERE id=$1;", [rental.rows[0].gameId]);
    const estoque = jogo.rows[0].stockTotal + 1;
    await connectionDB.query('UPDATE games SET "stockTotal"=$1 WHERE id=$2;', [estoque, rental.rows[0].gameId])
    

    try {

        if (diferenca > prazo) {
            console.log("caiu no if diferenca>prazo")
            const precoDia = jogo.rows[0].pricePerDay;
            const multa = (diferenca - prazo) * precoDia;
            await connectionDB.query('UPDATE rentals SET "delayFee"=$1 WHERE id=$2;', [multa, id]);
            await connectionDB.query('UPDATE rentals SET "returnDate"=$1 WHERE id=$2;', [returnDate, id]);
            res.sendStatus(200);
            return;
        }

        console.log("nao passou pelo if", today, id)
        await connectionDB.query('UPDATE rentals SET "returnDate"=$1 WHERE id=$2;', [today, id]);
        res.sendStatus(200);
        return;

    } catch (error) {

        console.log(error, "erro no try/catch de endRental");
        res.sendStatus(500);
        return

    }

}

export async function deleteRental(req, res){

    const { id } = req.params;

    const rental = await connectionDB.query("SELECT * FROM rentals WHERE id=$1;", [id]);
    if(rental.rows.length === 0){
        console.log("id não encontrado em endRental")
        res.sendStatus(404);
        return;
    }

    if(rental.rows[0].returnDate === null){
        console.log("rental nao finalizado")
        res.sendStatus(400);
        return;
    }

    try {

        await connectionDB.query("DELETE FROM rentals WHERE id=$1", [id]);
        res.sendStatus(200);
        return

    } catch (error) {
        console.log(error, "erro no try/catch de deleteRental");
        res.sendStatus(500);
        return
    }

}