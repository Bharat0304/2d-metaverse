export {Router } from 'express';
import { Router, type Request, type Response } from 'express';
import { SignupRequestSchema } from '../../types/index.js';
import {prisma }   from '@repo/db';
import bcrypt from 'bcrypt';    
export const authRouter: Router = Router();
authRouter.post('/signup',async(req:Request,res:Response)=>{
    const parsedData=SignupRequestSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            msg:"Invalid request data",
        });
    }
    const hashedpassword = await bcrypt.hash(parsedData.data.password,10);
    try{
    const data= await prisma.user.create({
        data:{
            email:parsedData.data.email,
            password:hashedpassword, 
            name:parsedData.data.name,
          
        }
    
    })
    return res.status(201).json({message:"User created successfully"});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:"Internal Server Error"});
    }
})
authRouter.post('/login',async(req:Request,res:Response)=>{
    const parsedData=SignupRequestSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({error:parsedData.error});
    }
  
    try{
        const user= await prisma.user.findUnique({
            where:{
                email:parsedData.data.email,
               
            }
        })
        const hashedpassword=await bcrypt.compare(parsedData.data.password,user?.password || "");
        if(!hashedpassword){
            return res.status(401).json({error:"Invalid eeeemail or password"});
        }
       
        return res.status(200).json({message:"Login successful"});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({error:"Internal Server Error"});
    }
})



























