import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import path from "path";


cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

export const uploadCloudinary = async  (localFilePath : any)=> {

    try {

        console.log('this is localfilepath', localFilePath);
        
        if(!localFilePath) return null;
        
        const fullPath = path.resolve(localFilePath)

        console.log('fullpath at upload coludinary try', fullPath);
        

        const res = await  cloudinary.uploader.upload(fullPath, {
            resource_type : "auto"
        })

        console.log('file has been  uploaded to cloud', res.url );
        
        if(fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath); 
        }
        
        return res;
  
    }catch(err : any) {

        console.log('cloudinary error', err?.message);
        
        const fullPath = path?.resolve(localFilePath)

        console.log('fullpath at upload coludinary catch', fullPath);

        
        if(fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
        }

        return null

    }

}


