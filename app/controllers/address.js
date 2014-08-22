var mongoose = require('mongoose'),
    Address = mongoose.model('Address');

exports.show = function(req, res) {

    Address.findOne({
        zipCode: req.params.zipcode
    }, function(err, address) {
        if (err) res.send("error happend: " + err);
        console.log(address);
        if (address) res.json(address);
        else res.status(404).json({
            title: "該当住所見つかりません",
            msg: "該当郵便番号で住所を見つかりませんでした"
        });
    });
};