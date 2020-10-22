import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AddressAutocompleteComponent } from './address-autocomplete/address-autocomplete.component';

import { PanelModule } from 'primeng/panel';

import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { LibAddressAutocompleteByComponentModule } from '@bpost/bp-address-auto-complete-by-component';

export function HttpLoaderFactory(http: HttpClient) {                   // <------
  // const i18nResourcePath = environment.i18nResourcePath;
  return new MultiTranslateHttpLoader(http, [
      {prefix: './assets/i18n/', suffix: '.json'},
      {prefix: './assets/aacwidget/i18n/', suffix: '.json'}
      // {prefix: /*'./shared/assets/i18n/'*/ i18nResourcePath, suffix: '.json'},
  ]);
}

@NgModule({
  declarations: [
    AppComponent,
    AddressAutocompleteComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    PanelModule,

    TranslateModule.forRoot({               // <------
      defaultLanguage: 'en',
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),

    LibAddressAutocompleteByComponentModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
