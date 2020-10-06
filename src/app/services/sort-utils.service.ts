import {Injectable} from '@angular/core';
import {combineAll} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SortUtilsService {

  constructor() {
  }

  sortByKey(list: any[], key: string, asc: boolean) {
    if (list) {
      if(asc){
        list.sort(this.compareValues(key, 'asc'));
      } else {
        list.sort(this.compareValues(key, 'desc'));
      }

    }
    return list;
  }

  compareValues(key: string, order: string) {
    return function (a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        return 0;
      }
      var varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
      var varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];

      var comparision = 0;
      if (varA > varB) {
        comparision = 1;
      } else if (varA < varB) {
        comparision = -1;
      }

      return (
        (order == 'desc') ? (comparision * -1) : comparision
      );
    };
  }
}
