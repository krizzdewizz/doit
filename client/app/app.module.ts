import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { APP_COMPONENTS, AppComponent } from './components';

import { TaskService } from './task/task.service';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [...APP_COMPONENTS],
  providers: [TaskService],
  bootstrap: [AppComponent]
})
export class AppModule { }