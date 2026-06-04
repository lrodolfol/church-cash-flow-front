import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ResultViewModel } from "../models/churchEntitieModels/resultViewModel.models";
import { AuthService } from "./auth.services";
import { Observable, catchError, of } from "rxjs";
import { configAplication } from "../config/configAplication";

export abstract class BaseService {
  protected url: string = '';
  protected modelName!: string;

  constructor(protected http: HttpClient) {
    this.url = configAplication.getApiHosy();
  }

  public async getUrlPreSigned(): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var result: ResultViewModel;
    var msgErro: string[];

    const returnPromise = new Promise<ResultViewModel>((resolve, reject) => {
      this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/UrlPreSignedPhoto`, { headers: httpHeaders })
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

  public async create(model: any): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    var churchId = (auth.getModelFromToken()).churchId;
    model.churchId = churchId;

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var result: ResultViewModel;
    var msgErro: string[];

    const returnPromise = new Promise<ResultViewModel>((resolve, reject) => {
      this.http.post<ResultViewModel>(`${this.url}/v1/${this.modelName}`, model, { headers: httpHeaders })
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

  public async update(model: any, modelId: string): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    var msgErro: string[];
    var churchId = (auth.getModelFromToken()).churchId;

    model.churchId = churchId;

    const returnPromise = new Promise<ResultViewModel>((resolve, reject) => {
      this.http.put<ResultViewModel>(`${this.url}/v1/${this.modelName}/${modelId}`, model, { headers: httpHeaders })
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

  public getById(id: number): ResultViewModel | PromiseLike<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/${id}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    });
  }

  public searchByCodeByChurch(code: string): ResultViewModel | PromiseLike<ResultViewModel> {
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
        throw new Error('Result is undefined.');
      }
    });
  }

  public searchByCodeGeneral(code: string): ResultViewModel | PromiseLike<ResultViewModel> {
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

  public async getByPeriod(initialDate: string, finalDate: string): Promise<ResultViewModel> {
    var auth = new AuthService();
    const token = auth.getToken();

    var churchId = (auth.getModelFromToken()).churchId;

    const httpHeaders = new HttpHeaders()
      .set("Content-Type", "application/json; charset=utf-8")
      .set("Authorization", `Bearer ${JSON.parse(token)}`);

    const returnObservable = this.http.get<ResultViewModel>(`${this.url}/v1/${this.modelName}/period/${churchId}/?initialDate=${initialDate}&finalDate=${finalDate}`, { headers: httpHeaders }).toPromise();

    return returnObservable.then(result => {
      if (result) {
        return result;
      } else {
        throw new Error('Result is undefined.');
      }
    }).catch(e => {
      throw new Error('Result is undefined.');
    });
  }

}