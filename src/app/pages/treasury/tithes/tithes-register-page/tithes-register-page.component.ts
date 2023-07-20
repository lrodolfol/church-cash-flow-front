import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MemberHandler } from 'src/app/handlers/memberHandler';
import { TithesHandler } from 'src/app/handlers/tithesHandler';
import { Member } from 'src/app/models/Member.models';
import { ModelToken } from 'src/app/models/ModelToken.models';
import { Tithes } from 'src/app/models/Tithes.models';
import { MeetingKind } from 'src/app/models/meetingKind.models copy';
import { OfferingKind } from 'src/app/models/offeringKind.models';
import { ResultViewModel } from 'src/app/models/resultViewModel.models';
import { AuthService } from 'src/app/services/auth.services';
import { MeetingKindService } from 'src/app/services/meetingKind.services';
import { OfferingKindService } from 'src/app/services/offeringKind.services';
import { ExcelMethods } from 'src/app/utils/excelMethods.utils';

@Component({
  selector: 'app-tithes-register-page',
  templateUrl: './tithes-register-page.component.html'
})
export class TithesRegisterPageComponent implements OnInit {
  protected typeSave = "create";
  protected formTreasury!: FormGroup;
  protected formSearchTreasury!: FormGroup;

  protected busy = false;
  protected searchBusy = false;
  private auth: AuthService

  protected modelToken: ModelToken;

  protected offeringKind!: ResultViewModel['data'];
  protected offeringKindToSelect!: [string, string][]

  protected members!: ResultViewModel['data'];
  protected membersToSelect!: [string, string][]

  public offeringKindSelected: string | undefined;
  public meetingKindSelected: string | undefined;

  public msgErros: string[] = [];
  public msgSuccesss: string[] = [];
  public msgImport: string = "";

  public selectedFileExcel: File | undefined;
  private fileReader: FileReader | undefined;
  private codeSearch: number = 0;

  constructor(private handler: TithesHandler, private offeringKindService: OfferingKindService, private churchHandler: MemberHandler,
    private fbuilder: FormBuilder, private route: ActivatedRoute) {

    this.auth = new AuthService();
    this.modelToken = this.auth.getModelFromToken();

    this.formSearchTreasury = this.fbuilder.group({
      code: ['']
    });

    this.formTreasury = this.fbuilder.group({
      member: ['', Validators.compose([
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
      resume: ['']
    });
  }

  async ngOnInit() {
    this.route.queryParams
      .subscribe(params => {
        this.codeSearch = params['id'];
      });

    await this.dashBoard();
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
      console.log('error to get offering-kind:', error);
    }
  }

  protected async loadMembers() {
    try {
      const dados = await this.churchHandler.getByChurch();
      this.members = dados;

      var meuObjeto: Record<string, string> = {};
      var cont = 1;

      this.members.forEach((x: string) => {
        var key = x;
        var value = cont;

        cont++;
        meuObjeto[key] = `${value}`;
      });

      this.membersToSelect = Object.entries(meuObjeto);
      
    } catch (error) {
      console.log('error to get offering-kind:', error);
    }
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
    var objTithes: Tithes = modelToForm.data;

    this.fillFormWithOffering(objTithes, code);

    this.searchBusy = false;
  }

  private fillFormWithOffering(offering: Tithes, code: number) {
    var dayConvert = new Date(offering.day);
    var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

    // this.formSearchTreasury.controls['code'].setValue(code);
    // this.formTreasury.controls['preacherMemberName'].setValue(offering.preacherMemberName);
    // this.formTreasury.controls['day'].setValue(formatDate(offering.day, 'yyyy-MM-dd', 'en'));
    // this.formTreasury.controls['description'].setValue(offering.description);
    // this.formTreasury.controls['adultQuantity'].setValue(offering.adultQuantity);
    // this.formTreasury.controls['totalPeoples'].setValue((offering.adultQuantity + offering.childrenQuantity));
    // this.formTreasury.controls['childrenQuantity'].setValue(offering.childrenQuantity);
    // this.formTreasury.controls['totalAmount'].setValue(offering.totalAmount);
    // this.formTreasury.controls['offeringKindId'].setValue(offering.offeringKindId);
    // this.formTreasury.controls['meetingKindId'].setValue(offering.meetingKindId);

    // var resume = `Culto do dia ${dayStr} com ministração do(a) ${offering.preacherMemberName}.
    // total de oferta em R$ ${offering.totalAmount} com ${offering.adultQuantity} adultos e ${offering.childrenQuantity} crianças. ofertas sendo ${offering.offeringKind}. ${offering.meetingKind}`

    // this.formTreasury.controls['resume'].setValue(resume);
  }

  protected async clearForm() {
    this.msgErros = [];
    this.msgSuccesss = [];
    this.msgImport = "";
    this.handler.clear();

    this.formTreasury.reset();
    this.formSearchTreasury.reset();

    this.typeSave = "create";
  }

  protected async save() {
    this.searchBusy = true;

    if (this.typeSave == "create") {
      await this.createOffering(this.formTreasury.value)
    } else if (this.typeSave == "update") {
      await this.updateOffering(this.formTreasury.value, this.formSearchTreasury.value.code);
    }

    this.searchBusy = false;
  }

  private async createOffering(model: Tithes) {
    this.clearForm();
    var create = await this.handler.create(model)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro ao cadastrar a oferta. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  private async updateOffering(offering: Tithes, offeringId: string) {
    this.handler.update(offering, offeringId)
      .then((result) => {
      })
      .catch((error) => {
        this.msgErros.push("Ocorreu um erro ao atualizar a oferta. Tente novamente");
      });

    this.msgErros = this.handler.getMsgErro();
    this.msgSuccesss = this.handler.getMsgSuccess();
  }

  public setExcel(event: any): void {
    this.clearForm();

    this.selectedFileExcel = event.target.files[0];
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
    var offering: Tithes = new Tithes();
    arrayOffering.forEach(x => {
      if (cont > 0) {
        offering.active = true;
        //offering.preacherMemberName = x[0];
        offering.day = x[1];
        offering.description = x[2];
        //offering.adultQuantity = x[3];
        //offering.childrenQuantity = x[4];
        offering.totalAmount = x[5];
        //offering.offeringKindId = x[6];
        //offering.meetingKindId = x[7];
        this.createOffering(offering);
      }

      cont = cont + 1;
    });
  }



  protected showResume() {
    var c = '';
    var z = '';
    if (this.formTreasury.controls['offeringKindId'].value > 0) {
      var i = this.formTreasury.controls['offeringKindId'].value;
      var ii: number = i - 1;
      c = this.offeringKindToSelect[ii][0];
    }

    if (this.formTreasury.controls['member'].value > 0) {
      var y = this.formTreasury.controls['meetingKindId'].value;
      var yy: number = y - 1;
      z = this.membersToSelect![yy][0];
    }

    if (this.formTreasury.valid) {
      var model: Tithes = this.formTreasury.value;
      var dayConvert = new Date(model.day);
      var dayStr = `${dayConvert.getDate().toString().padStart(2, '0')}/${dayConvert.getMonth().toString().padStart(2, '0')}/${dayConvert.getFullYear()}`

      var resume = `Culto do dia ${dayStr} com ministração do(a) ${model}.
      total de oferta em R$ ${model.totalAmount} com ${model} adultos e ${model} crianças. ofertas sendo ${c}. ${z}`

      this.formTreasury.controls['resume'].setValue(resume);
    }
  }

}
