const isLogin = async (req, res, next) => {
    
    try {
        if (req.session.admin) {
            console.log("admin mid if")
            
            next();

        } else {
            console.log("is login else");
            res.redirect("/admin");

        }
        
    } catch (error) {

        console.log(error.message);
        
    }

};

const isLogout = async (req, res, next) => {

    try {

        if (req.session.admin) {
            
            res.redirect("/admin/dashboard");

        } else {

            next();

        }
        
    } catch (error) {

        console.log(error.message);
        
    }  

};



module.exports = {

    isLogin,
    isLogout,

}