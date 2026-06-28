import { read } from "xlsx";
import { EntitieResultApi } from "../churchEntitieModels/Entitie.models";
import { Offering } from "../churchEntitieModels/offering.models";
import { Tithes } from "../churchEntitieModels/Tithes.models";
import { FirstFruits } from "../churchEntitieModels/firstFruits.model";

export class FirstFruitsEditModel extends EntitieResultApi {
    Day: string = "";
    Competence: string = "";
    Description: string = "";
    TotalAmount: number = 0;
    OfferingKindId: number = 0;
    ChurchId: number = 0;
    MemberId: number = 0;

    public ConvertTo(model: FirstFruits) : FirstFruitsEditModel  {
        var readDto = new FirstFruitsEditModel();
        readDto.Day = model.day;
        readDto.Competence = model.competence;
        readDto.ChurchId = model.churchId;
        readDto.OfferingKindId = model.offeringKindId;
        readDto.TotalAmount = model.totalAmount;
        readDto.active = model.active;
        readDto.Description = model.description;
        readDto.MemberId = model.memberId;
        
        return readDto;
    }


}