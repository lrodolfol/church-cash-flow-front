import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { BaseService } from "./base.services";
import { DashBoardService } from "./dashboard.service";
import { ResultViewModel } from "../models/resultViewModel.models";
import { AuthService } from "./auth.services";
import { Injectable } from "@angular/core";
import { Offering } from "../models/offering.models";
import { EMPTY, Observable, catchError, lastValueFrom, map, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class OfferingService extends BaseService {
  dashBoardServices: DashBoardService;
  private modelName = "offering";

  constructor(http: HttpClient, dashBoardServices: DashBoardService) {
    super(http);
    this.dashBoardServices = dashBoardServices;
  }

  public getOfferingByMonth(): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var churchId = (auth.getModelFromToken()).churchId;
    var yearMonth = this.dashBoardServices.getDashBoardMonth();

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/all/${churchId}/${yearMonth}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result.data;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public searchOfferingByCode(code: number): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    var churchId = (auth.getModelFromToken()).churchId;

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${churchId}/${code}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        console.log('nao deu');
        throw new Error('Result is undefined.');
      }
    });
  }

  public async createOffering(offering: Offering) : Promise<ResultViewModel | null> {
    var auth = new AuthService();
    const token = auth.getToken();

    var churchId = (auth.getModelFromToken()).churchId;
    offering.churchId = churchId;

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var result: ResultViewModel;
    var msgErro : string[];

    // const returnObservable = this.http.post<ResultViewModel>(`${this.url}/v1/${this.modelName}`, offering, { headers: httpHeaders }).subscribe(
    //   {
    //     next: (response) => {
    //       console.log(response);
    //       result = response;
    //     },
    //     error: (erro) => {
    //       console.log(erro)
    //       msgErro = erro.error.erros;
    //     }
    //   }
    // )

    const returnPromise = new Promise<ResultViewModel>((resolve, reject) => {
      this.http.post<ResultViewModel>(`${this.url}/v1/${this.modelName}`, offering, { headers: httpHeaders })
        .pipe(
          catchError((error: any): Observable<ResultViewModel> => {
            //console.log(error.error);
            //msgErro = error.message;
            //console.error('There was an error!', error);
            msgErro = error.error.erros;
            return of<ResultViewModel>(error.error);
          })
        )
        .subscribe(
          (data: ResultViewModel) => {
            resolve(data);
          },
          (error: any) => {
            reject(error);
          }
        );
    });
    
    return returnPromise;
  }
}