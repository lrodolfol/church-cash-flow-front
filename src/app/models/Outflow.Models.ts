import { EntitieResultApi } from "./Entitie.models";

export class OutFlow extends EntitieResultApi {
    day: Date = new Date();
    competence: string = "";
    description: string = "";
    authorized: boolean = true;
    amount: number = 0;
    interest: number = 0;
    discount: number = 0;
    totalAmount: number = 0;
    outFlow: string = "";
    church: string = "";
}