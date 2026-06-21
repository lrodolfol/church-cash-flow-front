import { Injectable } from "@angular/core";
import { BaseHandler } from "./baseHandler";
import { UserEditModel } from "../models/EditModels/user.mode";
import { UserServices } from "../services/user.services";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";

@Injectable({
    providedIn: 'root'
})

export class userHandler extends BaseHandler {
    private service: UserServices;

    constructor(handlerService: UserServices) {
        super();
        this.service = handlerService;
    }

    public async create(handler: UserEditModel): Promise<Boolean> {
        if(! await this.checkUser(handler)){
            this.setMsgErro("Preencha todos os campos corretamente");
            return false;
        }

        var result = await this.service.create(handler);
        if (result!.errors!.length > 0) {
            result!.errors!.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            this.setMsgSuccess("usuário salvo com sucesso");
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

    public async getById(id: number): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getById(id);
        return result;
    }

    public async getAll(): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getAll();
        return result;
    }


    public async deleteById(id: number): Promise<boolean> {
        var result = await this.service.delete(id);
        if(result != null && (result.errors!.length > 0)){
            this.msgError.push("Erro ao deletar secretário");
            return false;
        }
        
        this.msgSuccess.push("Secretário deletado com sucesso");
        return true;
    }

    private async checkUser(model: UserEditModel): Promise<boolean>{
        if(model.churchId <= 0 || model.churchId == null)
            return false;
        if(model.name.trim() == "")
            return false;
        if(model.roleIds.length <= 0 ||  model.roleIds == null)
            return false;
        if(model.passwordHash.trim() == "")
            return false;
        
        if(model.roleIds.some(element => element <= 0))
            return false;

        return true;
    }
}