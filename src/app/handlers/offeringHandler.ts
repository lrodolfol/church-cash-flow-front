import { Injectable } from "@angular/core";
import { Offering } from "../models/churchEntitieModels/offering.models";
import { OfferingService } from "../services/offering.services";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { BaseHandler } from "./baseHandler";
import { OfferingEditModel } from "../models/EditModels/OfferingEdit.model";

@Injectable({
    providedIn: 'root'
})

export class OfferingHandler extends BaseHandler {
    
    private service: OfferingService;

    constructor(offeringService: OfferingService) {
        super();
        this.service = offeringService;
    }

    public async delete(id: number) {
      var result = await  this.service.delete(id);

      if (result!.errors != null && result!.errors.length > 0) {
        result!.errors.forEach(x => {
            this.setMsgErro(x);
        })
        return false;
        } else {
            this.setMsgSuccess("oferta excluída com sucesso");
            return true;
        }
    }

    public async create(offering: OfferingEditModel): Promise<Boolean> {
        var result = await this.service.create(offering);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("oferta salva com sucesso");
            return true;
        }
    }

    public async update(offering: OfferingEditModel, offeringId: string): Promise<Boolean> {
        if(!offering || offeringId == ""){
            this.setMsgErro("data invalid!")
            return false;
        }

        var result = await this.service.update(offering, offeringId);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("oferta salva com sucesso");
            return true;
        }
    }

    public async getUrlPreSigned(): Promise<string> {
        var result: ResultViewModel = await this.service.getUrlPreSigned();
        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return "";
        } else {
            return result.data;
        }
    }

    public async getById(id: number) : Promise<ResultViewModel>{
        var result: ResultViewModel = await this.service.searchOfferingById(id);
        return result;
    }

    public async getOfferingLimit(limit: number): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getOfferingLimit(limit);
        return result;
    }

    public async getOfferingByPeriod(initialDate: string, finalDate: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getByPeriod(initialDate, finalDate);
        return result;
    }

  
}