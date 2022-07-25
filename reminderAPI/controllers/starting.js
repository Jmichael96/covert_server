exports.start = (req, res, next) => {
     return res.status(200).json({ serverMsg: 'Hello!' });
};