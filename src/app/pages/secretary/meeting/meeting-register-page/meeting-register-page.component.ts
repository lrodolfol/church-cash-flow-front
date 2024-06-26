import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeetingHandler } from 'src/app/handlers/meetingKindHandler';
import { MeetingKindEditModel } from 'src/app/models/EditModels/MeetingKind.model';
import { MeetingKindReadModel } from 'src/app/models/ReadModels/MeetingKindRead.model';
import { ResultViewModel } from 'src/app/models/churchEntitieModels/resultViewModel.models';
import { RegistersPageComponent } from 'src/app/pages/shared/registers-page/registers-page.component';

@Component({
  selector: 'app-meeting-register-page',
  templateUrl: './meeting-register-page.component.html'
})
export class MeetingRegisterPageComponent extends RegistersPageComponent {
  public formSearch!: FormGroup;
  public formPrincipal!: FormGroup;
  private meetingKindCode: string = "";

  constructor(private fbuilder: FormBuilder, private handler: MeetingHandler) {
    super();
    this.formSearch = this.fbuilder.group({
      code: ['', Validators.compose([
        Validators.required
      ])],
    });

    this.formPrincipal = this.fbuilder.group({
      name: ['', Validators.compose([
        Validators.required
      ])],
      description: ['', Validators.compose([
        Validators.required
      ])],
    });
  }

  protected override clearForm(): void {
    this.clearCommonObj();
    this.formPrincipal.reset();
    this.formSearch.reset();
    this.typeSave = "create";
  }

  public dashBoard(): void{
    this.clearForm();
  }

  protected async save(): Promise<void>{
    this.searchBusy = true;

    var meetingKind: MeetingKindEditModel = this.formPrincipal.value;
       
    if(this.typeSave == "create"){
      await this.handler.create(meetingKind);
    }else if(this.typeSave == "update"){
      await this.handler.update(meetingKind, this.meetingKindCode);
    }

    this.clearForm();
    
    this.msgSuccesss = this.handler.getMsgSuccess();
    this.msgErros = this.handler.getMsgErro();
    this.searchBusy = false;
  }

  protected async searchByCode(code: string = "") {
    this.searchBusy = true;
    
    if (code.length <= 0)
      code = this.formSearch.value.code;

    this.meetingKindCode = code;
    var modelToForm: ResultViewModel = await this.handler.getByCode(code);

    this.clearForm();
    
    if (modelToForm.errors!.length > 0) {
      this.searchBusy = false;
      this.msgErros.push("Culto não encontrado");
      return;
    }

    console.log(modelToForm);

    this.typeSave = "update";
    var objModel: MeetingKindReadModel = modelToForm.data;

    this.fillFormWithModel(objModel);

    this.searchBusy = false;
    this.typeSave = "update";
    this.formSearch.controls['code'].setValue(code);
  }

  private fillFormWithModel(model: MeetingKindReadModel): void {
    this.formPrincipal.controls['name'].setValue(model.name);
    this.formPrincipal.controls['description'].setValue(model.description);
  }

}
