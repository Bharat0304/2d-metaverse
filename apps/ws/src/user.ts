
    import WebSocket from "ws"; 
    import{ prisma} from "@repo/db";
function generateSessionId():string{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    for (let i = 0; i < 16; i++) {
        sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sessionId;
}
export class User{
    public readonly sessionId:string;
    public spaceId:string | null=null;
    public x:number;
    public ws:WebSocket;
    public y:number;
    constructor( ws :WebSocket){
        this.ws=ws;
        this.sessionId=generateSessionId();
         this.x=0;
        this.y=0;
    }
    InitHandler(){
        this.ws.on('message',async(data)=>{
            const message=JSON.parse(data.toString());
            this.handlemessage(message);
        })
        this.ws.on('close',()=>{
            console.log(`User ${this.sessionId} disconnected`);
        })
    }
    async handlemessage(message:any){
        switch(message.type){
            case 'join space':
            await this.joinSpace(message.spaceId);
            break;
            case 'move':
            this.moveMessage(message.dx,message.dy);
            break;
        }
    }
    async joinSpace(spaceId:string){
        const space = await prisma.space.findUnique({where:{id:spaceId}});
        if(space){
            this.spaceId=spaceId;
            console.log(`User ${this.sessionId} joined space ${spaceId}`);
    }
        this.spaceId=spaceId;
        this.ws.send(JSON.stringify({
            type:'joined space',
            sessionId:this.sessionId
        }))


    }
    async moveMessage(dx:number,dy:number){
        this.x+=dx;
        this.y+=dy;
    }
    cleanup(){
        console.log("User disconnected ")   // Clean up resources, if needed
    }
}

































