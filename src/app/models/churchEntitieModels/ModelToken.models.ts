export class ModelToken {
    userid: number = 0;
    churchId: number = 0;
    exp: number = 0;
    iat: number = 0;
    nbf: number = 0;
    churchName : string = "";
    usercode: string = "";
    unique_name: string = "";
    role: string = "";

    firstName() : string {
        return this.unique_name.split(" ")[0];
    }
    
}