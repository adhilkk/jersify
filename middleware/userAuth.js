const User = require('../models/userModel')

const user = async(req , res , next)=>{

    try {

        if(!req.session.user){

            res.redirect('/login')
    
        } else {
    
            next()
    
        }
    
        
    } catch (error) {

        console.log(error);
        
    }
  
};
const loginUser = async(req , res , next)=>{

 try {

    if(req.session.user){

        res.redirect('/')
        

    } else {

        next()

    }
    
 } catch (error) {

    console.log(error);
    
 }

};

const blockuser = async(req,res , next)=>{
    try {
        if(req.session.user)
        {
           const userData =await User.findOne({_id:req.session.user._id})
           console.log(userData,'userData');
           

           if(userData.is_blocked == true)
           {

            delete req.session.user
             res.redirect('/login')

           } else {
            console.log("ayoooo");
            

            next()

           }

        }else {

            next()

        }
    } catch (error) {
        
    }
}

module.exports = {

    user,
    loginUser,
    blockuser,

}