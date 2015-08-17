module.exports = function(req, res, next) {
    req.session.destroy();
    res.json({});
};
