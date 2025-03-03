const {server} = require("../app")

function startServer(){
    global.log("info", "IN");

    server.listen(global.settings.port, () => {
        console.log(`Server Running on port : ${global.settings.port}`);
    });
    global.log("info", "OUT");

}


module.exports = { startServer };