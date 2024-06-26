import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { AuthService } from "./auth.services";
import { Injectable } from "@angular/core";
import { DashBoardService } from "./dashboard.service";
import { BaseChurchService } from "./baseChurch.services";
import { Observable, catchError, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class ChurchService extends BaseChurchService {
  dashBoardServices: DashBoardService;

  constructor(http: HttpClient, dashBoardServices: DashBoardService) {
    super(http);
    this.dashBoardServices = dashBoardServices;
    this.modelName = "church";
  }

  getChurchById(code: string): ResultViewModel | PromiseLike<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${code}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public async getMembers(): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    var churchId = (auth.getModelFromToken()).churchId;

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${churchId}/members`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public async getMembersByChurchByIdPass(idChurch: string): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${idChurch}/members`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public getMembersByChurchByMonth(): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var churchId = (auth.getModelFromToken()).churchId;
    var yearMonth = this.dashBoardServices.getDashBoardMonth();

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${churchId}/members/${yearMonth}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });

  }

  getChurchByPeriod(initialDate: string, finalDate: string): ResultViewModel | PromiseLike<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/period?initialDate=${initialDate}&finalDate=${finalDate}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public delete(id: number): Promise<ResultViewModel | null> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var result: ResultViewModel;
    var msgErro: string[];

    const returnPromise = new Promise<ResultViewModel>((resolve, reject) => {
      this.http.delete<ResultViewModel>(`${this.url}/v1/${this.modelName}/${id}`, { headers: httpHeaders })
        .pipe(
          catchError((error: any): Observable<ResultViewModel> => {
            msgErro = error.error.erros;
            return of<ResultViewModel>(error.error);
          })
        )
        .subscribe({
          next(value) {
            resolve(value);
          },
          error(err) {
            reject(err);
          }
        });
    });

    return returnPromise;
  }
  
}