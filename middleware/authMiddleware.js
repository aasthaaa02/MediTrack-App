const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function authMiddleware(req, res, next){
  try{
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'No token' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(payload.id);
    if(!user) return res.status(401).json({ error: 'Invalid user' });
    req.user = user;
    next();
  }catch(e){
    return res.status(401).json({ error: 'Unauthorized', details: e.message });
  }
}

module.exports = authMiddleware;
