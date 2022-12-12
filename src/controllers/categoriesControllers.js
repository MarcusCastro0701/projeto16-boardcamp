import { connectionDB } from "../database/db.js"


export async function getCategories(req, res) {
    
try {
    const categorias = await connectionDB.query("SELECT * FROM categories;");
    res.send(categorias.rows);
    return
} catch (error) {
    console.log(error, "Deu ruim no get /categories!");
    res.status(500).send(error)
    return
}

};

export async function createCategories(req, res){

    const { name } = req.body;

    if(name.length === 0){
        console.log("name é uma string vazia")
        res.sendStatus(400);
        return
    }

    console.log("Tentando verificar")
    const repete = await connectionDB.query(`SELECT * FROM categories WHERE name = '${name}';`);
    if(repete.rows.length !== 0){
        console.log("essa categoria já existe")
        res.sendStatus(409);
        return
    }

    try {
        console.log("Tentando!")
        await connectionDB.query("INSERT INTO categories (name) VALUES ($1);", [name]);
        res.sendStatus(200)
    } catch (error) {
        console.log(error, "DEU RUIM");
        res.status(500).send(error);
        return
    }
    

}