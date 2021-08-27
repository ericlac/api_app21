import {NgModule} from '@angular/core';
//EL: import {IonicPageModule} from "@ionic/angular";
import {IonicModule} from "@ionic/angular";
import {DetailsPage} from "./details";

@NgModule({
  declarations: [
    DetailsPage
  ],
  /*EL imports: [
    IonicModule.forChild(DetailsPage)
  ],
  */
  entryComponents: [
    DetailsPage
  ]
})
export class DetailsPageModule {
}
