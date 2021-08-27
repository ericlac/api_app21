import {NgModule} from '@angular/core';
//EL: import {IonicPageModule} from "@ionic/angular";
import {IonicModule} from "@ionic/angular";
import {EditAvatar} from "./edit-avatar";

@NgModule({
  declarations: [
    EditAvatar
  ],
  /*EL
  imports: [
    IonicPageModule.forChild(EditAvatar)
  ],
  */
  entryComponents: [
    EditAvatar
  ]
})
export class EditAvatarModule {
}
