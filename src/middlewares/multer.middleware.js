import multer from "multer"

// uploading file to server diskStorage..
// to a destinatoin with filename which are 
//  specified in method
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, "./public/temp")
        },
    filename: function(req,file,cb){
        cb(null, file.originalname)
        }
})

export const upload = multer({
    storage, // means storage:storage
})

/*here we make middleware using multer
so whereever we got need of file upload capabilities,
we inject multer there (eg. registration form to save avatar)
((Please read the multer doc(readme) on github))
here we use diskStorage to store it on disk....

When user is uploading file...we don't get file in body of request..
thats why we used multer coz it gives access to file..cb is callback
whose first param is for error which we set null...second param is destinaiton
folder where we wanna save file..

 */