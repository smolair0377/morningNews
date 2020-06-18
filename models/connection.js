var mongoose = require('mongoose');

var options = {
    connectTimeoutMS: 5000,
    useUnifiedTopology : true,
    useNewUrlParser: true,
}
var identification = {
    ID: 'admin',
    password: '00000007', 
    dataBase: 'morningNews',
}

mongoose.connect(`mongodb+srv://${identification.ID}:${identification.password}@cluster0-aszpt.mongodb.net/${identification.dataBase}?retryWrites=true&w=majority`,
    options,
    function(err){
        console.log(err);
    }
)

module.exports = mongoose
