import { BaseModel } from "./BaseModel.model";

export class OutflowEditModel extends BaseModel {
    active: boolean = true;
    day: string = "";
    competence: string = "";
    description: string = "";
    authorized: boolean = true;
    amount: number = 0;
    interest: number = 0;
    discount: number = 0;
    totalAmount: number = 0;
    outFlowKindId: number = 0;
    churchId: number = 0;
    base64Image: string = "";
}