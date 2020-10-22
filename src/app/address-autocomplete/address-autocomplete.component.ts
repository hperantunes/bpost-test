import { Component, OnInit } from '@angular/core';
import { PrefilledParameters, ValidationMessageOptionType } from '@bpost/bp-address-auto-complete-by-component';

export class Lang {
  constructor(public key: string, public val: string) {}
}

@Component({
  selector: 'app-address-autocomplete',
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss']
})
export class AddressAutocompleteComponent implements OnInit {

  title = 'Bpost abc widget demo app';

  selectedLanguage: string = null;
  defaultLanguage = 'fr';

  loading = true;
  clearInput: { setFocus: boolean, timestamp: Date } = null; // { setFocus: true, timestamp: new Date() };

  defaultValidationMessageOptionType = ValidationMessageOptionType.SHOW;

  validationMessageOption = {validationType: this.defaultValidationMessageOptionType, timestamp: new Date() };
  selectedValidationMessageOption = this.defaultValidationMessageOptionType;

  /*
    The widget is making some validation.
    You can choose to let the widget show the validation message, or to emit it as an event you capture
    so that you can customize the handling of the validation notification
  */
  validationMessageOptions /*: [{key: ValidationMessageOptionType, val: string}]*/ = [
    {key: ValidationMessageOptionType.SHOW, val: 'Show'},
    {key: ValidationMessageOptionType.EMIT, val: 'Emit'}
  ];

  // Fixed enumerations
  messageOptions: Array<object> = [
    { id: 'Y', name: 'ON' },
    { id: 'P', name: 'ON(P)' },
    { id: 'N', name: 'OFF' }
  ];

  maxSuggestions: Array<object> = [
    { id: 5, name: 'Default(5)' },
    { id: 10, name: '10' },
    { id: 20, name: '20' },
    { id: 50, name: '50' },
    { id: 100, name: '100' },
    { id: 99999, name: '99999' }
  ];

  visibleSuggestions: Array<object> = [
    { id: 5, name: 'Default(5)' },
    { id: 10, name: '10' },
    { id: 15, name: '15' },
    { id: 20, name: '20' }
  ];

  // Fixed enumeration
  localitySortCriterias: Array<object> = [
    { id: '', name: 'Server Decides' },
    { id: 'P', name: 'Postal Codes' },
    { id: 'L', name: 'Locality' },
  ];

  // Fixed enumeration
  streetSortCriterias: Array<object> = [
    { id: '', name: 'Server Decides' },
    { id: 'S', name: 'Street Names' }
  ];

  // Fixed enumeration
  streetNbSortCriterias: Array<object> = [
    { id: '', name: 'Server Decides' },
    { id: 'S', name: 'Street Numbers' }
  ];

  // Fixed enumeration
  boxNbSortCriterias: Array<object> = [
    { id: '', name: 'Server Decides' },
    { id: 'B', name: 'Box Numbers' }
  ];

  readonly languages: Array<Lang> = [
    new Lang('en', 'EN'),
    new Lang('fr', 'FR'),
    new Lang('nl', 'NL'),
    new Lang('de', 'DE'),
    new Lang('browser', 'Browser')
  ];

  // Imposed and mandatory values
  // Don't change these values untill bpost ask for!
  localityUrl = 'https://webservices-pub.bpost.be/ws/ExternalMailingAddressProofingCSREST_v1/address/autocomplete/locality';
  streetUrl = 'https://webservices-pub.bpost.be/ws/ExternalMailingAddressProofingCSREST_v1/address/autocomplete/street';
  streetNumberUrl = 'https://webservices-pub.bpost.be/ws/ExternalMailingAddressProofingCSREST_v1/address/autocomplete/streetNumber';
  boxNumberUrl = 'https://webservices-pub.bpost.be/ws/ExternalMailingAddressProofingCSREST_v1/address/autocomplete/boxNumber';

  minLevel: number;
  prefillLevel: number;

  selectedMessage = {};

  maxSuggestionLocality: object;
  visibleSuggestionLocality: object;
  sortCriteriaLocality: object;

  maxSuggestionStreet: object;
  visibleSuggestionStreet: object;
  sortCriteriaStreet: object;

  maxSuggestionStreetNb: object;
  visibleSuggestionStreetNb: object;
  sortCriteriaStreetNb: object;

  maxSuggestionBoxNb: object;
  visibleSuggestionBoxNb: object;
  sortCriteriaBoxNb: object;

  selectedAddress: any = null;
  completeAddress: string = null;
  isInternal: boolean;
  prefilledParameters: PrefilledParameters;
  unstructuredAddress: string;
  streetName: string;
  streetNumber: string;
  boxNumber: string;
  postalCode: string;
  municipalityName: string;
  state = false;
  environmentFunction: any;
  notInListAllowed: boolean;

  showSelectedAddress = false;


  constructor() { }


  ngOnInit(): void {
    this.selectedMessage = this.messageOptions[0];

    this.maxSuggestionLocality =
      this.maxSuggestionStreet = this.maxSuggestionStreetNb = this.maxSuggestionBoxNb =  this.maxSuggestions[0];

    this.visibleSuggestionLocality =
      this.visibleSuggestionStreet = this.visibleSuggestionStreetNb = this.visibleSuggestionBoxNb = this.visibleSuggestions[0];

    this.sortCriteriaLocality =
      this.sortCriteriaStreet = this.sortCriteriaStreetNb = this.sortCriteriaBoxNb = this.localitySortCriterias[0];


    this.selectedAddress = null; // $$ {};
    this.isInternal = false;
    this.notInListAllowed = false;
    this.unstructuredAddress = '';
    this.streetName = '';
    this.streetNumber = '';
    this.boxNumber = '';
    this.postalCode = '';
    this.municipalityName = '';
    this.minLevel = 4;
    this.prefillLevel = 4;
    this.selectedLanguage = 'fr';
    this.loading = false;
    this.onChangeValidationMessageOption(null);
  }

  /*
    Multiple language support is not mandatory.
    You can just use the component using only one language.
    The only mandatory file in that case is the corresponding language json file
    to be put in the ./assets/aacwidget/i18n directory.

    We also take here the opportunity to capture the 'browser' default language.
    If the user selects the 'browser' language item in the language dropdown, the
    browser language itself is shown in the dropdown as the selected language.
    As you can see the widget is also supporting language localisation, meaning you can
    provide for language like fr_FR, fr_CA ...
  */
  onChangeLanguage(newLanguage: string) {
    if (newLanguage === 'browser') {
      const browserLang = navigator.language /*|| navigator.userLanguage*/;
      console.log('selected browser language:', browserLang);
      this.selectedLanguage = browserLang;
    } else {
      this.selectedLanguage = newLanguage;
    }
    return false;
  }

  onSetLanguage(lang: string) {
    this.selectedLanguage = lang;
  }

  onChangeValidationMessageOption(event) {
    // console.log('change validation message option:', event, this.validationMessageOption);
    this.validationMessageOption = { validationType: this.selectedValidationMessageOption, timestamp: new Date()};
  }

  setMessageOption(option, event?) {
    this.selectedMessage = option;
    if (event) { event.preventDefault(); }
  }

  setNotInListOption(option, event?) {
    this.notInListAllowed = option;
    if (event) { event.preventDefault(); }
  }

  setMaxSuggestion(option: object, level: number, event?) {
    if (event) { event.preventDefault(); }
    switch (level) {
      case 1:
        this.maxSuggestionBoxNb = option;
        break;

      case 2:
        this.maxSuggestionStreetNb = option;
        break;

      case 3:
        this.maxSuggestionStreet = option;
        break;

      case 4:
          this.maxSuggestionLocality = option;
          break;
      default:
        break;
    }
  }

  setVisibleSuggestion(option: object, level: number, event?) {
    if (event) { event.preventDefault(); }
    switch (level) {
      case 1:
        this.visibleSuggestionBoxNb = option;
        break;

      case 2:
        this.visibleSuggestionStreetNb = option;
        break;

      case 3:
        this.visibleSuggestionStreet = option;
        break;

      case 4:
          this.visibleSuggestionLocality = option;
          break;
      default:
        break;
    }
  }

  setSortCriteria(option: object, level: number, event?) {
    if (event) { event.preventDefault(); }
    switch (level) {
      case 1:
        this.sortCriteriaBoxNb = option;
        break;

      case 2:
        this.sortCriteriaStreetNb = option;
        break;

      case 3:
        this.sortCriteriaStreet = option;
        break;

      case 4:
          this.sortCriteriaLocality = option;
          break;
      default:
        break;
    }
  }

  onClearInput(focus: boolean) {
    this.clearInput = { setFocus: focus, timestamp: new Date() };
  }

  onAddressComplete(event) {
    console.log('address complete:', event);
    this.selectedAddress = event;
    this.updateCompleteAddress();
    this.showSelectedAddress = true;
  }

  updateCompleteAddress() {
    if (this.selectedAddress) {
      let concatStr = '';
      concatStr += this.selectedAddress.streetName ? `${this.selectedAddress.streetName} ` : '';
      concatStr += this.selectedAddress.houseNumber ? `${this.selectedAddress.houseNumber} ` : '';
      concatStr += this.selectedAddress.boxNumber ? `${this.getBoxPrefix()} ${this.selectedAddress.boxNumber} ` : '';
      concatStr += this.selectedAddress.postalCode ? `${this.selectedAddress.postalCode} ` : '';
      concatStr += this.selectedAddress.municipalityName ? `${this.selectedAddress.municipalityName} ` : '';
      this.completeAddress = concatStr;
    } else {
      this.completeAddress = '';
    }
  }

  getBoxPrefix(): string {
    let prefix = '';
    switch (this.selectedLanguage) {
      case 'fr':
        prefix = 'BTE';
        break;
      case 'nl':
          prefix = 'BUS';
          break;
      default:
        prefix = 'BOX';
        break;
    }
    return prefix;
  }

  isAddressComplete(): boolean {
    if (this.selectedAddress && this.selectedAddress.isComplete === true ) {
      return true;
    }
    return false;
  }

  onAddressValidationMessage(event) {
    console.log('Validation message:', event);
  }

  onSetValidationMessageOption(option, $event) {
    this.selectedValidationMessageOption = option;
    switch (option) {
      case 'EMIT':
        this.validationMessageOption = {validationType: ValidationMessageOptionType.EMIT, timestamp: new Date() };
        break;
      case 'SHOW':
        this.validationMessageOption = {validationType: ValidationMessageOptionType.SHOW, timestamp: new Date() };
        break;
    }
  }

  isSelectedAddressPresent(): boolean {
    return this.selectedAddress && this.selectedAddress !== null && this.selectedAddress !== undefined;
  }

  onClearInputEventEmitter(event: any) {
    console.log('clear input done: ', event);
    this.showSelectedAddress = false;
  }

}
