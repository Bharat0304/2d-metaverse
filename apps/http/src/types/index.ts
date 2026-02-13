import z from 'zod';
export const SignupRequestSchema = z.object({
    email:z.string(),
    password:z.string(),
    name:z.string(),
    status:z.enum(["ACTIVE","INACTIVE"]).optional()
   
});
export const LoginRequestSchema = z.object({
    email:z.string(),
    password:z.string(),
})
export const CreateSpaceRequestSchema=z.object({
    name:z.string(),
    description:z.string().optional(),
    isPublic:z.boolean().optional(),
    slug:z.string(),
})
export const CreateOrgRequestSchema=z.object({
    name:z.string(),
    spaceId:z.string().optional(),
})
export  const joinSchema=z.object({
    name:z.string(), 

})
export const CreateMapSchema=z.object({
    name:z.string(),
    height:z.number(),
    width:z.number(),
    tilesize:z.number()    
})
















































