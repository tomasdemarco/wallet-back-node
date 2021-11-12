const Extraction = require("../models/Extraction");
const Wallet = require("../models/Wallet");
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

//get one extraction
const postExtraction = async (req, res) => {
    try {
        const getOneExtraction = await Extraction.findOne(
            {
                document: req.body.document,
                code: req.body.code
            });
        var dateExtraction = Date.parse(getOneExtraction.createdAt) + 86400000
        if (Date.now() <= dateExtraction && getOneExtraction.isActive === true) {
            const getOneWallet = await Wallet.findOne({ idUser: getOneExtraction.idUser });
            let updateOneWallet
            getOneExtraction.currency === 1 ?
                getOneWallet.balancePesos >= getOneExtraction.amount ?
                    updateOneWallet = await Wallet.updateOne(
                        { idUser: getOneExtraction.idUser },
                        { $set: { balancePesos: getOneWallet.balancePesos - getOneExtraction.amount } }
                    )
                    : res.status(400).json({ message: "insufficient balance" })
                : getOneWallet.balanceDolares >= getOneExtraction.amount ?
                    updateOneWallet = await Wallet.updateOne(
                        { idUser: getOneExtraction.idUser },
                        { $set: { balanceDolares: getOneWallet.balanceDolares - getOneExtraction.amount } }
                    )
                    : res.status(400).json({ message: "insufficient balance" })
            const updateOneExtraction = await Extraction.updateOne(
                { _id: getOneExtraction._id },
                { $set: { isActive: false } }
            );

            if(updateOneExtraction.ok !== 0){
            var token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                user_id: getOneExtraction.idUser
            }, process.env.TOKEN_SECRET);

            const responseActivity = await axios.post('https://billetera-virtual-node-express.herokuapp.com/', {
                origen_id: getOneExtraction.idUser,
                tipo_transaccion: 4,
                moneda: getOneExtraction.currency,
                monto: getOneExtraction.amount
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                })
            res.json(responseActivity.data);
        }
        else{
            res.status(400).json({ error: `error insufficient balance` });
        }
        }
        else {
            res.status(401).json({ error: `error expired or inactive extraction` });
        }
    } catch (err) {
        res.status(500).json({ error: `error retrieving extraction` });
    }
};

module.exports = {
    postExtraction
};