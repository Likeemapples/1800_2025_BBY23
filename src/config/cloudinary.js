import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConfig } from "./auth.js";

cloudinary.config(cloudinaryConfig); 


    
  export { cloudinary };