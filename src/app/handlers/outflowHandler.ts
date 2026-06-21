import { Injectable } from "@angular/core";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { BaseHandler } from "./baseHandler";
import { OutflowService } from "../services/outflow.services";
import { OutflowEditModel } from "../models/EditModels/OutFlowEdit.Models";

@Injectable({
    providedIn: 'root'
})

export class OutFlowHandler extends BaseHandler {

    private service: OutflowService;

    constructor(service: OutflowService) {
        super();
        this.service = service;
    }

    public async create(handler: OutflowEditModel): Promise<Boolean> {
        var result = await this.service.create(handler);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("saida salva com sucesso");
            return true;
        }
    }

    public async update(model: OutflowEditModel, modelId: string): Promise<Boolean> {
        if (!model || modelId == "") {
            this.setMsgErro("data invalid!")
            return false;
        }

        var result = await this.service.update(model, modelId);

        if (result!.errors!.length > 0) {
            result!.errors!.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("saida salva com sucesso");
            return true;
        }
    }

    public async getOutflowByMonth(): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getOutflowByMonth();
        return result;
    }

    public async getOfferingByPeriod(initialDate: string, finalDate: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getByPeriod(initialDate, finalDate);
        return result;
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

    public async getById(id: number): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getById(id);
        return result;
    }

    public async delete(id: number) {
        var result = await this.service.delete(id);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("despesa excluída com sucesso");
            return true;
        }
    }

}