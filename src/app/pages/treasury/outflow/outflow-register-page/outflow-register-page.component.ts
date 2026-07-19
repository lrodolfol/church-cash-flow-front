import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OutFlowKindHandler } from 'src/app/handlers/outFlowKindHandler';
import { OutFlowHandler } from 'src/app/handlers/outflowHandler';
import { OutflowEditModel } from 'src/app/models/EditModels/OutFlowEdit.Models';
import { OutFlowKindReadModel } from 'src/app/models/ReadModels/OutFlowKindRead.model';
import { OutFlowReadModel } from 'src/app/models/ReadModels/OutflowRead.model';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { RegistersPageComponent } from 'src/app/pages/shared/registers-page/registers-page.component';
import { CloudService } from 'src/app/services/cloud.services';
import { ImageMethods } from 'src/app/utils/ImagesMethods.utils';

@Component({
  selector: 'app-outflow-register-page',
  templateUrl: './outflow-register-page.component.html'
})
export class OutflowRegisterPageComponent extends RegistersPageComponent{
  protected formOutflow!: FormGroup;
  protected formSearch!: FormGroup;
  
  protected outFlowKind!: ResultViewModel['data'];
  protected outFlowKindToSelect!: [string, string][]

  private codeSearch: number = 0;
  protected UrlPreSigned: string = "";
  protected fileImage: File | null = null;

  constructor(private handler: OutFlowHandler, private handlerOutFlowKind: OutFlowKindHandler, private fbuilder: FormBuilder,
    private route: ActivatedRoute, private cloudService: CloudService) {
    super();
    this.formSearch = this.fbuilder.group({
      code: ['']
    });

    this.formOutflow = this.fbuilder.group({
      day: ['', Validators.compose([
        Validators.required,
      ])],
      competence: ['', Validators.compose([
        Validators.required,
      ])],
      authorized: ['aprovado', Validators.compose([
        Validators.required
      ])],
      amount: ['', Validators.compose([
        Validators.required,
        Validators.min(0.1)
      ])],
      interest: ['', Validators.compose([
        Validators.required,
        Validators.min(0)
      ])],
      discount: ['', Validators.compose([
        Validators.required,
        Validators.min(0)
      ])],
      totalAmount: ['', Validators.compose([
        Validators.required,
        Validators.min(0.1),
      ])],
      description: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])],
      outflowKindId: ['', Validators.compose([
        Validators.required,
      ])],
      resume: ['']
    });
    this.formOutflow.controls['totalAmount'].disable();
    this.formOutflow.controls['authorized'].disable();
    this.formOutflow.controls['resume'].disable();
  }

  async ngOnInit() {
    this.clearForm();
    this.route.queryParams
      .subscribe(params => {
        this.codeSearch = params['id'];
      });

    await this.dashBoard();
    await this.getUrlPreSigned();
  }

  async getUrlPreSigned() {
    await this.handler.getUrlPreSigned()
      .then((result) => {
        this.UrlPreSigned = result;
      })
      .catch((error) => {
        this.msgErros.push("Falha ao buscar dados da página. Tente novamente");
      });
  }
  
 
  protected dashBoard(): void{
    this.busy = true;
    this.clearForm();

    this.loadOutFlowKind();
    
    this.busy = false;

    if (this.codeSearch > 0) {
      this.typeSave = "update"
      this.searchByCode(this.codeSearch);
    } 
  }

  protected async loadOutFlowKind() {
    try {
      const dados = await this.handlerOutFlowKind.getOfferingKind();
      this.outFlowKind = dados.data;
      const meuObjeto: Record<string, string> = {};

      this.outFlowKind.forEach((x: OutFlowKindReadModel) => {

        var key = x.name;
        var value = x.id

        meuObjeto[key] = `${value}`;
      });

      this.outFlowKindToSelect = Object.entries(meuObjeto);
      
    } catch (error) {
      console.log('error to get offering-kind:', error);
    }
  }

  protected override clearForm(): void {
    this.handler.clear();
    this.clearCommonObj();

    this.formOutflow.reset();
    this.formSearch.reset();

    this.typeSave = "create";
    this.fileImage = null;
    this.getUrlPreSigned();
    this.imageUrl = this.cloudService.getImageStore("common", "anonymou-user");
  }

  protected async save() {
    this.searchBusy = true;

    if (this.typeSave == "create") {
      if(this.formOutflow.invalid)
        return;

      await this.create(this.formOutflow.value)

    } else if (this.typeSave == "update") {
      await this.update(this.formOutflow.value, this.formSearch.value.code);
    }

    if (this.fileImage) {
      await this.cloudService.uploadToS3(this.fileImage, this.UrlPreSigned);
    }

    this.searchBusy = false;
  }
  private async create(model: OutflowEditModel) {
    model.base64Image = this.base64Image;
    model.authorized = true;
    model.Photo = this.UrlPreSigned;
    var create = await this.handler.create(model)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro no cadastro. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }
  private async update(model: OutflowEditModel, modelId: string) {
    model.base64Image = this.base64Image;
    model.authorized = true;
    console.log(this.base64Image);
    this.handler.update(model, modelId)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro ao atualizar a oferta. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  protected async searchByCode(code: number = 0) {
    this.searchBusy = true;
    
    if (code <= 0)
      code = this.formSearch.value.code;

    var modelToForm: ResultViewModel = await this.handler.getById(code);
    this.clearForm();
    
    if (modelToForm.errors!.length > 0) {
      this.searchBusy = false;
      this.msgErros.push("Offering not found");
      return;
    }

    this.typeSave = "update";
    var objTithes: OutFlowReadModel = modelToForm.data;
    this.hiddenImage = false;
    this.fillFormWithModel(objTithes, code);
    
    if(objTithes.photo != null && objTithes.photo != ""){
      this.imageUrl = this.cloudService.getUrlImageOutFlowStorage("outflow_"+objTithes.photo);
    }

    this.searchBusy = false
  }

  private fillFormWithModel(model: OutFlowReadModel, code: number) {
    var dayConvert = new Date(model.day);
    var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`;
    
    this.formSearch.controls['code'].setValue(code);2
    this.formOutflow.controls['day'].setValue(formatDate(model.day, 'yyyy-MM-dd', 'en'));
    var comp = model.competence.replace('/','-');
    var compSplit = comp.split("-");
    var comAnoMes = compSplit[1]+"-"+compSplit[0];
    this.formOutflow.controls['competence'].setValue(comAnoMes);
    this.formOutflow.controls['authorized'].setValue(model.authorized);        
    this.formOutflow.controls['amount'].setValue(model.amount);
    this.formOutflow.controls['interest'].setValue(model.interest);
    this.formOutflow.controls['discount'].setValue(model.discount);
    this.formOutflow.controls['totalAmount'].setValue(model.totalAmount);
    this.formOutflow.controls['description'].setValue(model.description);
    this.formOutflow.controls['outflowKindId'].setValue(model.outFlowKindId);

    var resume = `Despesa com ${model.outFlow!} para competencia de ${model.competence} realizado dia ${dayStr} total de ${model.totalAmount}`;

    this.formOutflow.controls['resume'].setValue(resume);
  }

  protected showResume() {
    var outflow: string = '';

    var amout = 0, interest = 0, discount = 0, totalAmount = 0;
    if(this.isNumeric(this.formOutflow.controls['amount'].value))
      amout = this.formOutflow.controls['amount'].value;
    if(this.isNumeric(this.formOutflow.controls['interest'].value))
    interest = this.formOutflow.controls['interest'].value;
    if(this.isNumeric(this.formOutflow.controls['discount'].value))
      discount = this.formOutflow.controls['discount'].value;

    totalAmount = (amout + interest - discount );  
    this.formOutflow.controls['totalAmount'].setValue(totalAmount);      

    if (this.formOutflow.controls['outflowKindId'].value > 0) {
      var value: string = this.formOutflow.controls['outflowKindId'].value.toString();
      var outflowSelect = this.outFlowKindToSelect.find(key => key[1] === value);
      outflow = outflowSelect![0];
    }

    if (this.formOutflow.valid) {
      var model: OutflowEditModel = this.formOutflow.value;
      var dayConvert = new Date(model.day);
      var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

      var resume = `Despesa com ${outflow!} para competencia de ${model.competence} realizado dia ${dayStr} total de ${totalAmount}`;

      this.formOutflow.controls['resume'].setValue(resume);
    }
  }

  protected loadImage(event: any) {
    this.msgErros = [];
    this.msgSuccesss = [];
    this.fileImage = event.target.files[0];
  }
}
