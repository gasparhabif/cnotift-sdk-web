import { Language } from '../constants/language.constants';

export interface IInternalMetadata {
  language: Language;
  platform: string;
  country: string;
  appVersion: string;
}

export class MetadataGenerator {
  constructor(private readonly appVersion) {}

  public getInternalMetadata(): IInternalMetadata {
    return {
      language: this.getLang(),
      platform: 'web',
      country: this.getCountry(),
      appVersion: this.appVersion ?? 'default',
    };
  }

  private getLang(): Language {
    const rawUserLang = (
      navigator.language.split('-')[0] || Language.unknown
    ).toLocaleLowerCase();

    const userLang = (
      (Object.values(Language) as string[]).includes(rawUserLang)
        ? rawUserLang
        : Language.unknown
    ) as Language;

    return userLang;
  }

  private getCountry(): string {
    return (
      navigator.language.split('-')[0] || Language.unknown
    ).toLocaleLowerCase();
  }

  private printCNotifySDK(message: string): void {
    console.log(`[CNotifySDK] ${message}`);
  }
}
