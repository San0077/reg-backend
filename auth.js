import jwt from 'jsonwebtoken'
//custom middleware
export const auth =(req,res,next)=>{
              try{
                
                const token = req.header("x-auth-token");
                if(!token){
                   return res.status(401).send({msg:err.message})
                }else{
                jwt.verify(token,"santhosh")
                next()
                }

              }catch(err){
                res.status(401).send({msg:err.message})
              }
}