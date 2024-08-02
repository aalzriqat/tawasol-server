import jwt, { decode } from "jsonwebtoken";
import config from "config";
import multer from 'multer'

const auth = (req, res, next) => {
    //get the token from the request header
    const token = req.header("x-auth-token");
    if (!token) {
      return res
        .status(401)
        .json({ msg: "token is not available, authorization denied" });
    }
    try {
      jwt.verify(token, config.get("jwtSecret"), (error, decoded) => {
        if (error) {
          return res
            .status(401)
            .json({ msg: "token is not valid, authorization denied" });
        } else {
          req.user = decoded.user;
          next();
        }
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error2");
    }
  };

  const storage =multer.diskStorage({
    destination: function (req,file,cd){
      cd(null,'./public/images');
    },
    filename: (req,file,cb) => {
      cb(null,`${req.user.id}`)
    }
  });

  const upload = multer({storage: storage}).single("file");
 export default {auth,upload};