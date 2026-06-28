import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChurchHadler } from 'src/app/handlers/churchHandler';
import { FirstFruitsHandler } from 'src/app/handlers/firstFruitsHandler';
import { FirstFruitsEditModel } from 'src/app/models/EditModels/firstFruitsEdit.models';
import { MemberReadModel } from 'src/app/models/ReadModels/MemberRead.models';
import { FirstFruits } from 'src/app/models/churchEntitieModels/firstFruits.model';
import { OfferingKind } from 'src/app/models/churchEntitieModels/offeringKind.models';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { RegistersPageComponent } from 'src/app/pages/shared/registers-page/registers-page.component';
import { CloudService } from 'src/app/services/cloud.services';
import { OfferingKindService } from 'src/app/services/offeringKind.services';
import { ImageMethods } from 'src/app/utils/ImagesMethods.utils';
import { ExcelMethods } from 'src/app/utils/excelMethods.utils';

@Component({
  selector: 'app-first-fruits-register-page',
  templateUrl: './first-fruits-register-page.component.html'
})
export class FirstFruitsRegisterPageComponent extends RegistersPageComponent implements OnInit {
  protected formTreasury!: FormGroup;
  protected formSearchTreasury!: FormGroup;

  protected offeringKind!: ResultViewModel['data'];
  protected offeringKindToSelect!: [string, string][]

  protected members!: ResultViewModel['data'];
  protected membersToSelect!: [string, string][]

  public offeringKindSelected: string | undefined;
  public meetingKindSelected: string | undefined;

  private codeSearch: number = 0;
  protected UrlPreSigned: string = "";
  protected fileImage: File | null = null;

  constructor(private handler: FirstFruitsHandler, private churchHandler: ChurchHadler, private offeringKindService: OfferingKindService,
    private fbuilder: FormBuilder, private route: ActivatedRoute, private cloudService: CloudService) {
    
    super();

    this.formSearchTreasury = this.fbuilder.group({
      code: ['']
    });

    this.formTreasury = this.fbuilder.group({
      memberId: ['', Validators.compose([
        Validators.required, ,
      ])],
      day: ['', Validators.compose([
        Validators.required,
      ])],
      description: ['', Validators.compose([
        Validators.required,
        Validators.minLength(6),
      ])],
      totalAmount: ['', Validators.compose([
        Validators.required,
      ])],
      offeringKindId: ['', Validators.compose([
        Validators.required,
      ])],
      competence: ['', Validators.compose([
        Validators.required,
      ])],
      resume: [''],
      photo: ['', Validators.compose([
      ])],
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
    await this.handler.getUrlPreSigned()
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
    this.loadMembers();

    this.busy = false;

    if (this.codeSearch > 0) {
      this.typeSave = "update"
      this.searchByCode(this.codeSearch);
    }

  }

  protected async loadOfferingKind() {
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
      console.error('error to get offering-kind:', error);
    }
  }

  protected async loadMembers() {
      const dados = await this.churchHandler.getByChurch();
      this.members = dados.data;
      var meuObjeto: Record<string, string> = {};
      this.members.forEach((x: MemberReadModel) => {
        var key = x.name;
        var value = x.id;

        meuObjeto[key] = `${value}`;
      });

      this.membersToSelect = Object.entries(meuObjeto);
  }

  protected async searchByCode(code: number = 0) {
    this.searchBusy = true;
    
    if (code <= 0)
      code = this.formSearchTreasury.value.code;

    var modelToForm: ResultViewModel = await this.handler.getById(code);

    this.clearForm();
    
    if (modelToForm.errors!.length > 0) {
      this.searchBusy = false;
      this.msgErros.push("Offering not found");
      return;
    }

    this.typeSave = "update";
    var objTithes: FirstFruits = modelToForm.data;

    this.fillFormWithModel(objTithes, code);

    this.searchBusy = false;
  }

  private fillFormWithModel(model: FirstFruits, code: number) {
    var dayConvert = new Date(model.day);
    var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

    if(model.photo != null && model.photo.length > 5) {
      this.imageBusy = true;
      this.imageUrl = this.cloudService.getUrlImageFirstFruitsStorage(model.photo);
      this.imageBusy = false;
    }else{
      this.imageUrl = this.cloudService.getImageStore("common", "no-file");
    }
    
    this.formSearchTreasury.controls['code'].setValue(code);
    this.formTreasury.controls['memberId'].setValue(model.memberId);
    this.formTreasury.controls['day'].setValue(formatDate(model.day, 'yyyy-MM-dd', 'en'));
    var comp = model.competence.replace('/','-');
    var compSplit = comp.split("-");
    var comAnoMes = compSplit[1]+"-"+compSplit[0];
    this.formTreasury.controls['competence'].setValue(comAnoMes);
    this.formTreasury.controls['description'].setValue(model.description);
    this.formTreasury.controls['totalAmount'].setValue(model.totalAmount);
    this.formTreasury.controls['offeringKindId'].setValue(model.offeringKindId);
    
    var resume = `Primícia do(a) ${model.member} com competencia de ${model.competence} realizado dia ${dayStr} em forma de ${model.offeringKind}`;

    this.formTreasury.controls['resume'].setValue(resume);
  }

  protected override async clearForm() {
    this.handler.clear();
    this.clearCommonObj();
    this.formTreasury.reset();
    this.formSearchTreasury.reset();
    this.fileImage = null;
    this.getUrlPreSigned();
  }

  protected async save() {
    this.searchBusy = true;

    if (this.typeSave == "create") {
      if(this.formTreasury.invalid)
        return;

      await this.create(this.formTreasury.value)

    } else if (this.typeSave == "update") {
      if(this.formTreasury.invalid)
        return;

      await this.update(this.formTreasury.value, this.formSearchTreasury.value.code);
    }

    if (this.fileImage) {
      console.log("Uploading image to S3");
      await this.cloudService.uploadToS3(this.fileImage, this.UrlPreSigned);
    }else{
      console.log("No image to upload");
    }

    this.searchBusy = false;
    this.getUrlPreSigned();
  }

  private async create(model: FirstFruits) {
    var editDto = new FirstFruitsEditModel();
    var dto = editDto.ConvertTo(model);

    var create = await this.handler.create(dto)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro no cadastro. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  private async update(model: FirstFruits, modelId: string) {
    var editDto = new FirstFruitsEditModel();
    var dto = editDto.ConvertTo(model);

    this.handler.update(dto, modelId)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro no cadastro. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  public readExcel(): void {
    this.clearForm();

    var excelMethods = new ExcelMethods();
    excelMethods.readExcel(this.selectedFileExcel!)
      .then((jsonData) => {
        this.createModelByExcel(jsonData);
      })
      .catch((error) => {
        this.msgErros = error;
      });
  }

  private createModelByExcel(arrayModel: Array<any>) {
    var cont = 0;
    var model: FirstFruits = new FirstFruits();
    arrayModel.forEach(x => {
      if (cont > 0) {
        model.active = true;
        model.memberId = x[0];
        model.day = x[1];
        model.competence = x[2];
        model.totalAmount = x[3];
        model.description = x[4];
        model.offeringKindId = x[5];
        
        this.create(model);
      }

      cont = cont + 1;
    });
  }

  protected showResume() {
    var oferta: string = '';
    var membro: string;

    if (this.formTreasury.controls['offeringKindId'].value > 0) {
      var value: string = this.formTreasury.controls['offeringKindId'].value.toString();
      var offeringSelect = this.offeringKindToSelect.find(key => key[1] === value);
      oferta = offeringSelect![0];
    }

    if (this.formTreasury.controls['memberId'].value > 0) {
      var value: string = this.formTreasury.controls['memberId'].value.toString();
      var memberSelect = this.membersToSelect.find(key => key[1] === value);
      membro = memberSelect![0];
    }

    if (this.formTreasury.valid) {
      var model: FirstFruits = this.formTreasury.value;
      var dayConvert = new Date(model.day);
      var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

      var resume = `Dízimo do(a) ${membro!} com competencia de ${model.competence} realizado dia ${dayStr} em forma de ${oferta}`;

      this.formTreasury.controls['resume'].setValue(resume);
    }
  }

  protected loadImage(event: any) {
    this.msgErros = [];
    this.msgSuccesss = [];
    this.fileImage = event.target.files[0];
    console.log("Selected file:", this.fileImage);
  }

}
