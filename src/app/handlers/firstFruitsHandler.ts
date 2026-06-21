import { Injectable } from "@angular/core";
import { TithesService } from "../services/tithes.service";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { Tithes } from "../models/churchEntitieModels/Tithes.models";
import { BaseHandler } from "./baseHandler";
import { FirstFruitsService } from "../services/firstFruits.services";
import { FirstFruits } from "../models/churchEntitieModels/firstFruits.model";
import { FirstFruitsEditModel } from "../models/EditModels/firstFruitsEdit.models";

@Injectable({
    providedIn: 'root'
})

export class FirstFruitsHandler extends BaseHandler{

    private service: FirstFruitsService;

    constructor(handlerService: FirstFruitsService) {
        super();
        this.service = handlerService;
    }

    public async create(handler: FirstFruitsEditModel): Promise<Boolean> {
        var result = await this.service.create(handler);
        
        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("primícia salvo com sucesso");
            return true;
        }
    }

        
    public async delete(id: number) {
        var result = await  this.service.delete(id);
  
        if (result!.errors != null && result!.errors.length > 0) {
          result!.errors.forEach(x => {
              this.setMsgErro(x);
          })
          return false;
          } else {
              this.setMsgSuccess("primícia excluído com sucesso");
              return true;
          }
      }

    public async update(model: FirstFruitsEditModel, modelId: string): Promise<Boolean> {
        if(!model || modelId == ""){
            this.setMsgErro("data invalid!")
            return false;
        }

        var result = await this.service.update(model, modelId);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("primícia salvo com sucesso");
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
        var result: ResultViewModel = await this.service.searchByIdByChurch(id);
        return result;
    }

    public async getByPeriod(initialDate: string, finalDate: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getByPeriod(initialDate, finalDate);
        return result;
    }
}