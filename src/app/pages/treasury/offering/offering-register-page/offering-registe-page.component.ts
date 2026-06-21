import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OfferingHandler } from 'src/app/handlers/offeringHandler';
import { OfferingEditModel } from 'src/app/models/EditModels/OfferingEdit.model';
import { MeetingKind } from 'src/app/models/churchEntitieModels/meetingKind.models copy';
import { Offering } from 'src/app/models/churchEntitieModels/offering.models';
import { OfferingKind } from 'src/app/models/churchEntitieModels/offeringKind.models';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { AuthService } from 'src/app/services/auth.services';
import { MeetingKindService } from 'src/app/services/meetingKind.services';
import { OfferingKindService } from 'src/app/services/offeringKind.services';
import { ImageMethods } from 'src/app/utils/ImagesMethods.utils';
import { ExcelMethods } from 'src/app/utils/excelMethods.utils';
import { CloudService } from 'src/app/services/cloud.services';
import { RegistersPageComponent } from 'src/app/pages/shared/registers-page/registers-page.component';

@Component({
  selector: 'app-treasury-registe-page',
  templateUrl: './offering-register-page.component.html'
})
export class offeringRegisterPageComponent extends RegistersPageComponent implements OnInit {
  protected formTreasury!: FormGroup;
  protected formSearchTreasury!: FormGroup;

  protected offeringKind!: ResultViewModel['data'];
  protected offeringKindToSelect!: [string, string][]
  
  protected meetingKind!: ResultViewModel['data'];
  protected meetingKindToSelect!: [string, string][];

  public offeringKindSelected: string | undefined;
  public meetingKindSelected: string | undefined;

  private codeSearch: number = 0;
  protected UrlPreSigned: string = "";
  protected fileImage: File | null = null;

  constructor(private offeringHandler: OfferingHandler, private offeringKindService: OfferingKindService, 
    private meetingKindService: MeetingKindService, private fbuilder: FormBuilder, private route: ActivatedRoute, 
    private cloudService: CloudService) {
    
    super();
    this.auth = new AuthService();
    this.modelToken = this.auth.getModelFromToken();

    this.formSearchTreasury = this.fbuilder.group({
      code: ['']
    });

    this.formTreasury = this.fbuilder.group({
      preacherMemberName: ['', Validators.compose([
        Validators.required,
        Validators.minLength(4),
      ])],
      day: ['', Validators.compose([
        Validators.required,
      ])],
      description: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])],
      adultQuantity: ['', Validators.compose([
        Validators.required,
      ])],
      childrenQuantity: ['', Validators.compose([
        Validators.required,
      ])],
      totalPeoples: [''],
      totalAmount: ['', Validators.compose([
        Validators.required,
      ])],
      offeringKindId: ['', Validators.compose([
        Validators.required,
      ])],
      meetingKindId: ['', Validators.compose([
        Validators.required,
      ])],
      photo: ['', Validators.compose([
      ])],
      resume: ['']
    });
  }

  async ngOnInit() {
    this.route.queryParams
    .subscribe(params => {
      this.codeSearch = params['id'];
    });

    await this.dashBoard();
    await this.getUrlPreSigned();
  }

  async getUrlPreSigned() {
    await this.offeringHandler.getUrlPreSigned()
      .then((result) => {
        this.UrlPreSigned = result;
      })
      .catch((error) => {
        this.msgErros.push("Falha ao buscar dados da página. Tente novamente");
      });
  }

  public async dashBoard() {
    this.busy = true;
    this.clearForm();

    this.loadOfferingKind();

    this.loadMeetingKind();

    this.busy = false;

    if(this.codeSearch > 0){
      this.typeSave = "update"
      this.searchOfferingByCode(this.codeSearch);
    }
  }

  protected async loadOfferingKind(){
    try {
      const dados = await this.offeringKindService.getOfferingKind();
      this.offeringKind = dados.data;
      const meuObjeto: Record<string, string> = {};

      this.offeringKind.forEach((x: OfferingKind) => {

        var key = x.name;
        var value = x.id

        meuObjeto[key] = `${value}`;
      });
      this.offeringKindToSelect = Object.entries(meuObjeto);

    } catch (error) {
      console.log('error to get offering-kind:', error);
    }
  }

  protected async loadMeetingKind(){
    try {
      const dados = await this.meetingKindService.getMeetingKind();
      
      this.meetingKind = dados.data;
      const meuObjeto: Record<string, string> = {};

      this.meetingKind.forEach((x: MeetingKind) => {

        var key = x.name;
        var value = x.id

        meuObjeto[key] = `${value}`;
      });
      this.meetingKindToSelect = Object.entries(meuObjeto);

    } catch (error) {
      console.log('error to get offering-kind:', error);
    }
  }

  protected async searchOfferingByCode(code: number = 0) {
    this.searchBusy = true;
    
    if(code <= 0)
      code = this.formSearchTreasury.value.code;

    var offeringToForm: ResultViewModel = await this.offeringHandler.getById(code);
    this.clearForm();

    if (offeringToForm.errors!.length > 0) {
      this.searchBusy = false;
      this.msgErros.push("Offering not found");
      return;
    }

    this.typeSave = "update";
    var objOffering: Offering = offeringToForm.data;

    this.fillFormWithOffering(objOffering, code);

    this.searchBusy = false;
  }

  private fillFormWithOffering(offering: Offering, code: number){
    var dayConvert = new Date(offering.day);
    var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

    if(offering.photo != null && offering.photo.length > 5) {
      this.imageBusy = true;
      this.imageUrl = this.cloudService.getUrlImageOfferingsStorage(offering.photo);
      this.imageBusy = false;
    }else{
      this.imageUrl = this.cloudService.getImageStore("common", "no-file");
    }

    this.formSearchTreasury.controls['code'].setValue(code);
    this.formTreasury.controls['preacherMemberName'].setValue(offering.preacherMemberName);
    this.formTreasury.controls['day'].setValue(formatDate(offering.day, 'yyyy-MM-dd', 'en'));
    this.formTreasury.controls['description'].setValue(offering.description);
    this.formTreasury.controls['adultQuantity'].setValue(offering.adultQuantity);
    this.formTreasury.controls['totalPeoples'].setValue((offering.adultQuantity + offering.childrenQuantity));
    this.formTreasury.controls['childrenQuantity'].setValue(offering.childrenQuantity);
    this.formTreasury.controls['totalAmount'].setValue(offering.totalAmount);
    this.formTreasury.controls['offeringKindId'].setValue(offering.offeringKindId);
    this.formTreasury.controls['meetingKindId'].setValue(offering.meetingKindId);

    var resume = `Culto do dia ${dayStr} com ministração do(a) ${offering.preacherMemberName}.
    total de oferta em R$ ${offering.totalAmount} com ${offering.adultQuantity} adultos e ${offering.childrenQuantity} crianças. ofertas sendo ${offering.offeringKind}. ${offering.meetingKind}`

    this.formTreasury.controls['resume'].setValue(resume);
  }

  protected async clearForm() {
    this.offeringHandler.clear();
    this.clearCommonObj();
    this.formTreasury.reset();
    this.formSearchTreasury.reset();
    this.fileImage = null;
    this.getUrlPreSigned();
  }

  protected async saveOffering() {
    this.searchBusy = true;

    if (this.typeSave == "create") {
      await this.createOffering(this.formTreasury.value)
    } else if (this.typeSave == "update") {
      await this.updateOffering(this.formTreasury.value, this.formSearchTreasury.value.code);
    }

    if (this.fileImage) {
      await this.cloudService.uploadToS3(this.fileImage, this.UrlPreSigned);
    }

    this.searchBusy = false;
  }

  private async createOffering(offering: Offering) {
    var readDto = new OfferingEditModel().ConvertTo(offering);
    readDto.base64Image = this.base64Image != null ? this.base64Image : "";    

    var create = await this.offeringHandler.create(readDto)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro ao cadastrar a oferta. Tente novamente");
      });

    this.msgErros = this.offeringHandler.getMsgErro();
    this.msgSuccesss = this.offeringHandler.getMsgSuccess();
  }

  private async updateOffering(offering: Offering, offeringId: string) {
    var readDto = new OfferingEditModel().ConvertTo(offering);
    readDto.base64Image = this.base64Image != null ? this.base64Image : "";  

    this.offeringHandler.update(readDto, offeringId)
    .then((result) => {
    })
    .catch((error) => {
      this.msgErros.push("Ocorreu um erro ao atualizar a oferta. Tente novamente");
    });

    this.msgErros = this.offeringHandler.getMsgErro();
    this.msgSuccesss = this.offeringHandler.getMsgSuccess();
  }

  public readExcel(): void {
    this.clearForm();

    var excelMethods = new ExcelMethods();
    excelMethods.readExcel(this.selectedFileExcel!)
      .then((jsonData) => {
        this.createOfferingByExcel(jsonData);
      })
      .catch((error) => {
        this.msgErros = error;
      });
  }

  private createOfferingByExcel(arrayOffering: Array<any>) {
    var cont = 0;
    var offering: Offering = new Offering();
    arrayOffering.forEach(x => {
      if (cont > 0) {
        offering.active = true;
        offering.preacherMemberName = x[0];
        offering.day = x[1];
        offering.description = x[2];
        offering.adultQuantity = x[3];
        offering.childrenQuantity = x[4];
        offering.totalAmount = x[5];
        offering.offeringKindId = x[6];
        offering.meetingKindId = x[7];
        this.createOffering(offering);
      }

      cont = cont + 1;
    });
  }

  protected sumPeoples() {
    this.formTreasury.controls['totalPeoples'].setValue(this.formTreasury.value.adultQuantity + this.formTreasury.value.childrenQuantity);
  }

  protected showResume() {
    var oferta = '';
    var culto = '';
    if (this.formTreasury.controls['offeringKindId'].value > 0) {
      var value: string = this.formTreasury.controls['offeringKindId'].value.toString();
      var offeringSelect = this.offeringKindToSelect.find(key => key[1] === value);
      oferta = offeringSelect![0];
    }

    if (this.formTreasury.controls['meetingKindId'].value > 0) {
      var value: string = this.formTreasury.controls['meetingKindId'].value.toString();
      var meetingSelect = this.meetingKindToSelect.find(key => key[1] === value); 
      culto = meetingSelect![0];
    }

    if (this.formTreasury.valid) {
      var objOffering: Offering = this.formTreasury.value;
      var dayConvert = new Date(objOffering.day);
      var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

      var resume = `Culto do dia ${dayStr} com ministração do(a) ${objOffering.preacherMemberName}.
      total de oferta em R$ ${objOffering.totalAmount} com ${objOffering.adultQuantity} adultos e ${objOffering.childrenQuantity} crianças. ofertas sendo ${oferta}. ${culto}`

      this.formTreasury.controls['resume'].setValue(resume);
    }
  }

  protected loadImage(event: any) {
    this.msgErros = [];
    this.msgSuccesss = [];
    this.fileImage = event.target.files[0];
  }

}
