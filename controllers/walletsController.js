const Wallet = require("../models/Wallet");
const Extraction = require("../models/Extraction");
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

//get one user
const getOneWallet = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const getOneWallet = await Wallet.findOne({ idUser: decoded.user_id });
    res.json(getOneWallet);
  } catch (err) {
    res.status(500).json({ error: `error retrieving Wallet` });
  }
};

//post new user:
const postWallet = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  const wallet = new Wallet({
    idUser: decoded.user_id
  });
  try {
    const newWallet = await wallet.save();
    res.status(201).json(newWallet);
  } catch (err) {
    res.status(500).json({ error: "error saving Wallet" });
  }
};

const addCard = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const updateOneWallet = await Wallet.updateOne(
      { idUser: decoded.user_id },
      { $set: { ...req.body } }
    )
    res.json(updateOneWallet);
  } catch (err) {
    res.status(500).json({ error: `error updating Wallet` });
  }
};

//modify:
const updateWallet = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const getOneWallet = await Wallet.findOne({ idUser: decoded.user_id });
    let updateOneWallet
    req.body.currency === 1 ?
      updateOneWallet = await Wallet.updateOne(
        { idUser: decoded.user_id },
        { $set: { balancePesos: getOneWallet.balancePesos + req.body.amount } }
      )
      : updateOneWallet = await Wallet.updateOne(
        { idUser: decoded.user_id },
        { $set: { balanceDolares: getOneWallet.balanceDolares + req.body.amount } }
      )

    const responseActivity = await axios.post('https://billetera-virtual-node-express.herokuapp.com/', {
      origen_id: decoded.user_id,
      tipo_transaccion: 3,
      moneda: req.body.currency,
      monto: req.body.amount
    },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
    res.json(responseActivity.data);
  } catch (err) {
    res.status(500).json({ error: `error updating Wallet` });
  }
};

//modify:
const postExtraction = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  var code = Math.floor(Math.random() * 999999);
  const extraction = new Extraction({
    idUser: decoded.user_id,
    document: req.body.document === 0 ? decoded?.user_document : req.body.document,
    code: code,
    amount: req.body.amount,
    currency: req.body.currency
  });
  try {
    const newExtraction = await extraction.save();
    res.json(newExtraction);
  } catch (err) {
    res.status(500).json({ error: "error saving extraction" });
  }
};

const approveRequest = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const getOneWallet = await Wallet.findOne({ idUser: decoded.user_id });
    var updateOneWallet, updateTwoWallet;
    {
      req.body.currency === 1 ?
        getOneWallet.balancePesos >= req.body.balance ?
          updateOneWallet = await Wallet.updateOne(
            { idUser: getOneWallet.idUser },
            { $set: { balancePesos: getOneWallet.balancePesos - req.body.balance } }
          )
          : res.json({ message: "insufficient balance" })
        : getOneWallet.balanceDolares >= req.body.balance ?
          updateOneWallet = await Wallet.updateOne(
            { idUser: getOneWallet.idUser },
            { $set: { balanceDolares: getOneWallet.balanceDolares - req.body.balance } }
          )
          : res.status(400).json({ message: "insufficient balance" })
    }
    const getTwoWallet = await Wallet.findOne({ idUser: req.body.idReceiver });
    {
      req.body.currency === 1 ?
        updateTwoWallet = await Wallet.updateOne(
          { idUser: getTwoWallet.idUser },
          { $set: { balancePesos: getTwoWallet.balancePesos + req.body.balance } }
        )
        : updateTwoWallet = await Wallet.updateOne(
          { idUser: getTwoWallet.idUser },
          { $set: { balanceDolares: getTwoWallet.balanceDolares + req.body.balance } }
        )
    }

    const responseActivity = await axios.patch(`https://billetera-virtual-node-express.herokuapp.com/${req.body.id}`, {
      estado: 1
    },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })

    res.json(responseActivity.data);
  } catch (err) {
    res.status(500).json({ error: `error updating Wallet` });
  }
};

const sendMoney = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const getOneWallet = await Wallet.findOne({ idUser: decoded.user_id });
    var updateOneWallet, updateTwoWallet;
    {
      req.body.currency === 1 ?
        getOneWallet.balancePesos >= req.body.balance ?
          updateOneWallet = await Wallet.updateOne(
            { idUser: getOneWallet.idUser },
            { $set: { balancePesos: getOneWallet.balancePesos - req.body.balance } }
          )
          : res.json({ message: "insufficient balance" })
        : getOneWallet.balanceDolares >= req.body.balance ?
          updateOneWallet = await Wallet.updateOne(
            { idUser: getOneWallet.idUser },
            { $set: { balanceDolares: getOneWallet.balanceDolares - req.body.balance } }
          )
          : res.status(400).json({ message: "insufficient balance" })
    }
    const getTwoWallet = await Wallet.findOne({ idUser: req.body.idReceiver });
    {
      req.body.currency === 1 ?
        updateTwoWallet = await Wallet.updateOne(
          { idUser: getTwoWallet.idUser },
          { $set: { balancePesos: getTwoWallet.balancePesos + req.body.balance } }
        )
        : updateTwoWallet = await Wallet.updateOne(
          { idUser: getTwoWallet.idUser },
          { $set: { balanceDolares: getTwoWallet.balanceDolares + req.body.balance } }
        )
    }
    if (updateOneWallet.ok !== 0) {
      const responseActivity = await axios.post('https://billetera-virtual-node-express.herokuapp.com/', {
        origen_id: decoded.user_id,
        origen_nombre: decoded.user_name + " " + decoded.user_lastname,
        destino_id: req.body.idReceiver,
        destino_nombre: req.body.nameReceiver,
        tipo_transaccion: 1,
        monto: req.body.balance,
        moneda: req.body.currency,
        estado: 1
      },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        })

      res.json(responseActivity.data);
    }
  } catch (err) {
    res.status(500).json({ error: `error updating Wallet` });
  }
};

//delete:
const deleteWallet = async (req, res) => {
  const token = req.headers["authorization"]
  var decoded = jwt.decode(token);
  try {
    const removeWallet = await Wallet.deleteOne({ idUser: decoded.user_id });
    res.json(removeWallet);
  } catch (err) {
    res.status(500).json({ error: "error removing Wallet" });
  }
};

const payToken = (req, res) => {
  var token = jwt.sign({
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    monto: req.body.monto,
    destino_nombre: req.body.destino_nombre,
    destino_id: req.body.destino_id,
    moneda: req.body.moneda,
    estado: req.body.estado,
  }, process.env.TOKEN_SECRET);
  res.json({ token: token });
};

module.exports = {
  getOneWallet,
  postWallet,
  deleteWallet,
  addCard,
  updateWallet,
  postExtraction,
  approveRequest,
  sendMoney,
  payToken
};