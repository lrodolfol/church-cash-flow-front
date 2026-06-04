import { Injectable } from "@angular/core";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { ChurchService } from "../services/church.services";
import { BaseHandler } from "./baseHandler";
import { ChurchReadModel } from "../models/ReadModels/ChurchRead.models";
import { DateTimeUtil } from "../models/utils/DateTime.utils";
import { StringUtil } from "../models/utils/String.utils";
import { ChurchEditModel } from "../models/EditModels/churchEdit.model";
import { AddressEditModel } from "../models/EditModels/Address.model";

@Injectable({
    providedIn: 'root'
})

export class ChurchHadler extends BaseHandler {
    private service: ChurchService;

    constructor(service: ChurchService) {
        super();
        this.service = service;
    }

    public async getChurchById(code: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getChurchById(code);
        
        return result;
    }

    public async getByChurch(): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getMembers();
        return result;
    }

    public async getByChurchByIdPass(idChurch: string): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getMembersByChurchByIdPass(idChurch);
        return result;
    }

    public async getMembersByChurch(): Promise<ResultViewModel> {
        var result: ResultViewModel = await this.service.getMembersByChurchByMonth();
        return result;
    }
    
    async getChurchByPeriod(initialDate: string, finalDate: string) : Promise<ResultViewModel>  {
        var result: ResultViewModel = await this.service.getChurchByPeriod(initialDate, finalDate);
        return result;
    }

    public async create(churchEdit: ChurchEditModel, addressEdit: AddressEditModel) {
        
        if (!this.validateChurchEdit(churchEdit))
            return false;

        if (!this.validateAddressEdit(addressEdit))
            return false;

        const createChurch = {
            active: true,
            editChurchDto: churchEdit,
            editAddressDto: addressEdit
        };

        var result = await this.service.create(createChurch);

        if (result!.errors!.some(value => true)) {
            result!.errors!.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            var resultData: ChurchReadModel = result!.data;
            this.setMsgSuccess(`Igreja ${churchEdit.name} - salva com sucesso`);
            return true;
        }
    }

    public async update(idChurch: string, churchEdit: ChurchEditModel, addressEdit: AddressEditModel) {
        if (!this.validateChurchEdit(churchEdit))
            return false;

        if (!this.validateAddressEdit(addressEdit))
            return false;

        const createChurch = {
            editChurchDto: churchEdit,
            editAddressDto: addressEdit
        };

        var result = await this.service.update(idChurch, createChurch);

        if (result!.errors!.some(value => true)) {
            result!.errors!.forEach(x => {
                this.setMsgErro(x);
            })
            return false;
        } else {
            var resultData: ChurchReadModel = result!.data;
            this.setMsgSuccess(`Igreja ${churchEdit.name} - salva com sucesso`);
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
              this.setMsgSuccess("igreja excluída");
              return true;
          }
    }

    validateChurchEdit(model: ChurchEditModel): boolean{
        var dateValidate = new DateTimeUtil();
        
        if(model.name.trim().length <= 2 || model.acronym.trim().length <= 2 || 
            !dateValidate.validateDate(model.registerDate) || !dateValidate.validateDate(model.inaugurationDate) ){
                this.setMsgErro("campos da Igreja inválidos");
                return false;
        }

        var idsMembersPost = [];
        idsMembersPost.push(model.firstPastorId);
        idsMembersPost.push(model.secondPastorId);
        idsMembersPost.push(model.firstSecretaryId);
        idsMembersPost.push(model.secondSecretaryId);
        idsMembersPost.push(model.firstTreasurerId);
        idsMembersPost.push(model.secondTreasurerId);

        const set = new Set();

        for (const valor of idsMembersPost) {
            if (set.has(valor) && valor != 0) {
                this.msgError.push("Um membro não pode ocupar mais de um cargo como pastor, tesoureiro e secretaria");
                return false; 
            }
            set.add(valor);
        }

        return true;
    }

    validateAddressEdit(model: AddressEditModel): boolean {
        var stringValidate = new StringUtil();
        if(!stringValidate.isNumeric(model.zipCode.toString().replace("-","")) || model.country.trim().length <= 3 || 
        model.state.trim().length <= 1 || model.city.trim().length <= 3 || model.district.trim().length <= 3 ||
        model.street.trim().length <= 3 || !stringValidate.isNumeric(model.number.toString()) ){
            this.setMsgErro("campos de endereço inválidos");
            return false;
        }

        return true;
    }
}