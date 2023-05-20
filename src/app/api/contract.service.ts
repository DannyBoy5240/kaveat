/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private http: HttpClient) { }

  uploadContract(user: User, filename, fileBlob, referralCode = null): Observable<any> {
    const formData = new FormData();
    // append user data
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    if (referralCode) {
      // console.log(referralCode);
      formData.append('referralCode', referralCode);
    }
    // formData.append('mode', user.mode ? user.mode : 'payment');
    formData.append(filename, fileBlob);

    // multipart/form-data content type
    return this.http.post(`${environment.baseUrl}/${environment.saveEndpoint}`, formData);
    // return of(1,2,3);
  }

  uploadMultipleContracts(user: User, fileBlobs, referralCode = null): Observable<any> {
    const formData = new FormData();
    // append user data
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    if (referralCode) {
      // console.log(referralCode);
      formData.append('referralCode', referralCode);
    }
    // formData.append('mode', user.mode ? user.mode : 'payment');
    fileBlobs.forEach((f,i) => {
      formData.append(f.name, f, f.name);
    });
    // multipart/form-data content type
    return this.http.post(`${environment.baseUrl}/${environment.saveEndpoint}`, formData);
    // return of(1,2,3);
  }

  loadAllContracts(user: User) {
    const httpOptions = {
      // headers: new HttpHeaders({
      //   Authorization: 'Bearer ' + token,
      //   'Access-Control-Allow-Origin': '*',
      // }),
      params: { email: user.email }
    };
    return this.http.get(`${environment.baseUrl}/${environment.grabContractsEndpoint}`, httpOptions);
  }

  getMetadata(id: string) {
    const httpOptions = {
      // headers: new HttpHeaders({
      //   Authorization: 'Bearer ' + token,
      //   'Access-Control-Allow-Origin': '*',
      // }),
      params: { id },
    };
    return this.http.get(`${environment.baseUrl}/${environment.contractMetaEndpoint}`, httpOptions);
  }

  loadContract(user: User, filename, isAnalysis = false) {
    const httpOptions = {
      // headers: new HttpHeaders({
      //   Authorization: 'Bearer ' + token,
      //   'Access-Control-Allow-Origin': '*',
      // }),
      params: { email: user.email, filename, isAnalysis },
      responseType: 'blob',
    };
    return this.http.get(`${environment.baseUrl}/${environment.contractFileEndpoint}`,
    { params: { email: user.email, filename, isAnalysis }, responseType: 'blob'});
  }

  // get contract clauses, explanations, and overview
  // getContractAnalysisData(user: User, filename) {
  //   return this.http.get(`${environment.baseUrl}/${environment.contractAnalysisDataEndpoint}`,
  //   { params: { email: user.email, filename } });
  // }


  updateMetadata(contractMetadata): Observable<any> {
    const updatedMeta = {
      contractId: contractMetadata.id,
      todos: Array.from(contractMetadata.todos),
      todosDone: Array.from(contractMetadata.todosDone)
    };
    // console.log(updatedMeta);
    return this.http.post(`${environment.baseUrl}/${environment.updateContractMetadataEndpoint}`, updatedMeta);
  }

  // updateResult(user: User, filename, fileBlob): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('email', user.email);
  //   // formData.append('contractId', contractMetadata.id);
  //   // console.log(typeof(contractMetadata.todos));
  //   // console.log(contractMetadata.todos);
  //   // // const todoblob = new Blob([contractMetadata.todos], { type: 'application/json'});
  //   // formData.append('todos', contractMetadata.todos);
  //   // formData.append('todosDone', contractMetadata.todosDone);
  //   formData.append(filename, fileBlob);
  //   return this.http.post(`${environment.baseUrl}/${environment.updateResultEndpoint}`, formData);
  // }
}
