import { Router } from "express";
import { type Request, type Response } from "express";
import { CreateMapSchema, CreateSpaceRequestSchema } from "../../types/index.js";
import { CreateOrgRequestSchema } from "../../types/index.js";
import { joinSchema } from "../../types/index.js";
import { prisma } from "@repo/db";

export const spaceRouter: Router = Router();

spaceRouter.post("/create", async (req: Request, res: Response) => {
  const parsedData = CreateSpaceRequestSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      error: parsedData.error.format(),
    });
  }

  try {
    const space = await prisma.space.create({
      data: {
        name: parsedData.data.name,
        slug: parsedData.data.slug,
        orgId: "org_123", // For simplicity, using a hardcoded orgId. In a real app, this would come from the authenticated user's session or token.

        ...(parsedData.data.description !== undefined && {
          description: parsedData.data.description,
        }),

        ...(parsedData.data.isPublic !== undefined && {
          isPublic: parsedData.data.isPublic,
        }),
      },
    });

    return res.status(201).json({
      message: "Space created successfully",
      space,
    });
  } catch (e: any) {
    // Unique constraint (slug already exists)
    if (e.code === "P2002") {
      return res.status(409).json({
        error: "Space with this slug already exists",
      });
    }

    console.error(e);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});
spaceRouter.post("/createorg",async(req:Request,res:Response)=>{
    const parsedData=CreateOrgRequestSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            error:parsedData.error.format(),
        });
    }
    try{
        const org=await prisma.organization.create({
            data:{
                name:parsedData.data.name,
                adminId:"user_123",
                spaceId:"space_123" 
            }
        })
        return res.status(201).json({
            message:"Organization created successfully",
            org,
        });

    }
    catch(e){
        console.error(e);
        return res.status(500).json({
            error:"Internal server error",
        });
    }

})
spaceRouter.post("/Room",async(req:Request,res:Response)=>{
    const parsedData=joinSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            error:parsedData.error.format(),
        });
    }
    try{
        const room=await prisma.room.create({
            data:{
                name:parsedData.data.name,
                spaceId:"space_123",
                mapId:"map_123"
            }
        })
        return res.status(201).json({
            message:"Room created successfully",
            room,
        });
    }
    catch(e){
        console.error(e);
        return res.status(500).json({
            error:"Internal server error",
        });
    }
})
spaceRouter.post("/createmap",async(req:Request,res:Response)=>{
    const parsedData=CreateMapSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            error:parsedData.error.format(),
        });
    }
    try{
        const map=await prisma.map.create({
            data:{
                name:parsedData.data.name,
                height:parsedData.data.height,
                width:parsedData.data.width,
                tileSize:parsedData.data.tilesize,
                adminId:"user_123",
                type:"HYBRID"    
            }

        })
        return res.status(201).json({
            message:"Map created successfully",
            map,
        });
    }
    catch(e){
        console.error(e);
        return res.status(500).json({
            error:"Internal server error",
        });
    }
})
spaceRouter.post("/assignMapToRoom",async(req:Request,res:Response)=>{
    const {roomId,mapId}=req.body;
    if(!roomId || !mapId){
        return res.status(400).json({
            error:"roomId and mapId are required",
        });
    }
    try{
        const room=await prisma.room.update({
            where:{
                id:roomId,
            },
            data:{
                mapId:mapId,
            }
        })
        return res.status(200).json({
            message:"Map assigned to room successfully",
            room,
        });
    }
    catch(e){
        console.error(e);
        return res.status(500).json({
            error:"Internal server error",
        });
    }
})

























