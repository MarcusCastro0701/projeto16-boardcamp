import { connectionDB } from "../database/db.js"
import joi from "joi"

const gameSchema = joi.object({
    name: joi.string().required().min(1),
    image: joi.required(),
    stockTotal: joi.number().required().min(0.0001),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().required().min(0.0001)
})

export async function getGames(req, res){

    const nameQuery = req.query.name;

    try {

        if (!nameQuery) {
            const games = await connectionDB.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id;');
            console.log("Retornando todos os games");
            res.send(games.rows);
            return
        }

        const filtrado = await connectionDB.query(`SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId"=categories.id WHERE LOWER (games.name) LIKE LOWER ('%${nameQuery}%');`)
        console.log("Retornando de acordo com a query strind 'name'");
        res.send(filtrado.rows);
        return

    } catch (error) {
        console.log(error);
        res.sendStatus(500);
        return
    }


}

export async function createGame(req, res){

    const idCategoria = req.body.categoryId;
    const nomeJogo = req.body.name;
    const imagem = req.body.image;
    const estoque = req.body.stockTotal;
    const precoDia = req.body.pricePerDay;
    const body = req.body;

    const validation = gameSchema.validate(body, { abortEarly: true });

    if(validation.error){
        const errors = validation.error.details.map(details => details.message)
        console.log(errors);
        res.sendStatus(422);
        return
    }

    const verificaCategoria = await connectionDB.query('SELECT * FROM categories WHERE id=$1;', [idCategoria]);
    if (verificaCategoria.rows.length === 0){
        console.log("id nao encontrado em post /games, id inválido");
        res.sendStatus(400);
        return
    }

    const verificaNome = await connectionDB.query("SELECT * FROM games WHERE name=$1;", [nomeJogo]);
    if(verificaNome.rows.length !== 0){
        console.log("já existe um jogo registrado com esse nome");
        res.sendStatus(409);
        return;
    }

    try {
        
        await connectionDB.query('INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);',
            [nomeJogo, imagem, estoque, idCategoria, precoDia]);
        console.log("Novo jogo inserido");
        res.sendStatus(200);
        return
    } catch (error) {
        console.log(error, "erro no try/catch do post /games");
        res.sendStatus(500);
        return
    }

}