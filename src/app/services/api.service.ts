import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {STORAGEKEY} from '../common/STORAGEKEY';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: string = environment.baseUrl;

  headers;

  constructor(private http: HttpClient) {
    this.SetHeaders();
  }

  private SetHeaders() {
    let headerValue = {};
    if (sessionStorage.getItem(STORAGEKEY.auth) != undefined && sessionStorage.getItem(STORAGEKEY.auth) != null) {
      var user = JSON.parse(sessionStorage.getItem(STORAGEKEY.auth));
      headerValue = {

        'Authorization': 'Bearer ' + user['access_token'],
      }
    } else {
      headerValue = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
    this.headers = new HttpHeaders(headerValue);
  }

  public Get(url: string) {
    try {
      this.SetHeaders();
      return this.http.get(url, {headers: this.headers});
    } catch (error) {
      return error
    }
  }

  public GetWithoutHeaders(url: string) {
    try {
      // this.SetHeaders();
      return this.http.get(url);
    } catch (error) {
      return error
    }
  }

  public Post(url: string, data: any) {
    try {
      this.SetHeaders();
      return this.http.post(url, data, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public PostCustom(url: string, data: any) {
    try {
      this.SetHeaders();
      return this.http.post(url, data, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public Put(url: string, data: any, file: File) {
    try {

      var user = JSON.parse(sessionStorage.getItem(STORAGEKEY.loginUser));
      let headerValue = {
        // 'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'Authorization': user['token'],
      };
      let formData = new FormData();
      if (file) {
        formData.append('avatar', file);
      }
      formData.append('data', JSON.stringify(data));
      this.headers = new HttpHeaders(headerValue);
      return this.http.put(this.baseUrl + url, formData, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public PutOthers(url: string, data: any) {
    try {
      this.SetHeaders();
      return this.http.put(this.baseUrl + url, data, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public Delete(url: string) {
    try {
      this.SetHeaders();
      return this.http.delete(this.baseUrl + url, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public PostByURL(url: string, data: any) {
    try {
      this.SetHeaders();
      return this.http.post(url, data, {headers: this.headers});
    } catch (error) {
      return error;
    }
  }

  public GetByURL(url: string) {
    try {
      this.SetHeaders();
      return this.http.get(url);
    } catch (error) {
      return error;
    }
  }

  public PostZoom(code) {
    const headers = {
      'Authorization': 'WFpfTm1TYnpSbFNXdEU4RXVOQjdOdzo3UFFjMWZocUFWbjNuZDhsTHNPYWZncEJxVnQwaFN4Sg==',
    }
    const url = 'https://zoom.us/oauth/token?grant_type=authorization_code&code=' + code + '&redirect_uri=http://localhost:4200/home';
    return this.http.post(url, '', {headers: headers});
  }
}
