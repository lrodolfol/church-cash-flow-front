import { Component, OnInit } from '@angular/core';
import { OfferingHandler } from 'src/app/handlers/offeringHandler';
import { Offering } from 'src/app/models/offering.models';
import { Router } from '@angular/router';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ExcelMethods } from 'src/app/utils/excelMethods.utils';

@Component({
  selector: 'app-treasury-offering-relatory-page',
  templateUrl: './treasury-offering-relatory-page.component.html'
})
export class TreasuryOfferingRelatoryPageComponent implements OnInit {
  private excelMethod: ExcelMethods;

  protected idHandle: number = 0;
  protected descriptionHandle: string = "";

  protected formLimit!: FormGroup;
  protected busy = false;
  protected offerings$!: Offering[];
  protected msgErrosOffering: string[] = [];
  protected msgSuccesssOffering: string[] = [];

  public DashMonth!:  [string, string][];
  public dashMonthSelected: string | undefined;
  

  constructor(private handler: OfferingHandler, private router: Router, private dashBoardService: DashBoardService, private fbuilder: FormBuilder) {
    this.formLimit = this.fbuilder.group({
      initialDate: ['', Validators.compose([
        Validators.required,
      ])],
      finalDate: ['', Validators.compose([
        Validators.required,
      ])]
    });

    this.excelMethod = new ExcelMethods();
  }

  async ngOnInit() {
      var today = new Date();
      var todayMinus = new Date(today);
      var d = today.getDate();
      todayMinus.setDate(today.getDate() - today.getDate() + 1);
      
      this.formLimit.controls['initialDate'].setValue(formatDate(todayMinus, 'yyyy-MM-dd', 'en'));
      this.formLimit.controls['finalDate'].setValue(formatDate(today, 'yyyy-MM-dd', 'en'));
    
    await this.dashBoard();
  }

  protected async dashBoard(){
    this.busy = true;   

    this.clear();

    var initialDate = this.formLimit.value.initialDate;
    var finalDate = this.formLimit.value.finalDate; 
    
    var result = await this.handler.getOfferingByPeriod(initialDate, finalDate);

    if(result.errors != null && result.errors.length > 0){
      this.offerings$ = [];
    }else{
      this.offerings$ = result.data;

      this.offerings$.forEach(x => {
        var daySplit = x.day.split("-");
        var dayStr = `${daySplit[2].replace('T00:00:00', '')}/${daySplit[1]}/${daySplit[0]}`;
        x.day = dayStr;
      });
    }
    this.loadDashMonth()
    this.busy = false;
  }

  public reload() {
    this.router.navigate([this.router.url]);
  }

  protected submit(){
    if(this.formLimit.invalid) {
      this.msgErrosOffering.push("Preenche todos os campos de pesquisa");
      return;
    }

    this.dashBoard();
  }

  public loadDashMonth() {
    const mesesAbreviados = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const dataAtual: Date = new Date();

    const mes: number = dataAtual.getMonth(); // +1 porque os meses são indexados de 0 a 11
    const mesFormatado: string = mes.toString().padStart(2, '0');

    const ano: number = dataAtual.getFullYear();
    const anoAnterior = ano - 1;

    const mesAno: string = `${ano}${mesFormatado}`;
    const meuObjeto: Record<string, string> = {};

    for (let index = mes; index >= 0; index--) {
      var key = `${(mesesAbreviados[index]).toString()}/${ano}`;
      var value = `${ano}${(index + 1).toString().padStart(2, '0')}`

      meuObjeto[key] = value;
    }

    for (let index = 11; index >= mes; index--) {
      var key = `${(mesesAbreviados[index])}/${anoAnterior}`;
      var value = `${anoAnterior}${(index + 1).toString().padStart(2, '0')}`

      meuObjeto[key] = value;
    }

    this.DashMonth = Object.entries(meuObjeto);
  }

  protected async changeDashMonth() {
    this.busy = true;
    this.dashBoardService.setDashBoardMonth(this.dashMonthSelected!.toString());

    await this.dashBoard();
    this.busy = false;
  }

  public setIdToDelete(eventId: any, eventDescription: string){
    this.idHandle = eventId
    this.descriptionHandle = eventDescription;
  }

  public deleteOffering(){
    if(this.idHandle > 0){
      var result = this.handler.delete(this.idHandle)
      .then((result) => {
        //console.log(result);
        this.dashBoard();
        this.msgErrosOffering = this.handler.getMsgErro();
        this.msgSuccesssOffering = this.handler.getMsgSuccess();
      })
      .catch((error) => {
        console.log(error);
      });
    }
    
  }

  protected clear(): void{
    this.msgErrosOffering = [];
    this.msgSuccesssOffering = [];
    this.descriptionHandle = "";
  }

  protected exportarExcel(){
    try{
      let element = document.getElementById('excel-table'); 
      var fileName = `relatorio-de-oferta`;
      this.excelMethod.exportExcel(element, fileName);

      this.msgSuccesssOffering.push("arquivo excel exportado. confira sua pasta de download");
    }catch{
      this.msgErrosOffering.push("Ocorreu um erro ao gerar o arquivo. tente novamente");
    }
  }

}