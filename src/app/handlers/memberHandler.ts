import { Injectable } from "@angular/core";
import { TithesService } from "../services/tithes.service";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { Tithes } from "../models/churchEntitieModels/Tithes.models";
import { MembersService } from "../services/members.services";
import { BaseHandler } from "./baseHandler";
import { MemberEditModel } from "../models/EditModels/MemberEdit.models";
import { MemberReadModel } from "../models/ReadModels/MemberRead.models";

@Injectable({
    providedIn: 'root'
})

export class MemberHandler extends BaseHandler {
    private service: MembersService;

    constructor(service: MembersService) {
        super();
        this.service = service;
    }

    public async getMembersByPeriod(initialDate: string, finalDate: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getOfferingByPeriod(initialDate, finalDate);
        return result;
    }

    public async getByChurch(): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getMembersByChurch();
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

    public async create(model: MemberEditModel): Promise<Boolean> {
        if (!this.validate(model))
            return false;

        var result = await this.service.create(model);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            var resultData: MemberReadModel = result!.data;
            this.setMsgSuccess(`Membro ${model.name} - ${resultData.code} salvo com sucesso`);
            return true;
        }
    }

    public async update(model: MemberEditModel, modelId: string): Promise<Boolean> {
        if (! await this.validate(model))
            return false;

        var result = await this.service.update(model, modelId);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            var resultData: MemberReadModel = result!.data;
            this.setMsgSuccess(`Membro salvo com sucesso`);

            return true;
        }
    }

    public async delete(id: number) {
        var result = await this.service.delete(id);

        if (result!.errors != null && result!.errors.length > 0) {
            result!.errors.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("membro excluído com sucesso");
            return true;
        }
    }

    private async validate(model: MemberEditModel): Promise<boolean> {
        if (model.name.length <= 0 || model.dateBirth.length <= 0 || model.description == "" || model.postIds.length <= 0) {
            this.setMsgErro("Informe os dados obrigatórios corretamente");
            return false;
        }

        return true;
    }

    public async getByCode(code: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.searchByCodeByChurch(code);
        return result;
    }

}