export class CNotifyTopicGenerator {
  private readonly baseTopic = 'cnotify_';
  private readonly allUsersTopic = '-all_users';
  private readonly audienceSeparator = '_aud';

  public getTopics({
    language,
    country,
    appVersion,
  }: {
    language: string;
    country: string;
    appVersion?: string;
  }): string[] {
    const topics: string[] = [];
    topics.push(this.buildTopic(language, this.soTopic()));
    topics.push(this.buildTopic(language, this.allUsersTopic));
    topics.push(this.buildTopic(language, this.countryTopic(country)));
    if (appVersion != null)
      topics.push(this.buildTopic(language, this.versionTopic(appVersion)));
    return topics;
  }

  private soTopic(): string {
    return '-os-web';
  }

  private countryTopic(country: string): string {
    return `-country-${country}`;
  }

  private versionTopic(version: string): string {
    return `-version-${version}`;
  }

  private langTopic(lang: string): string {
    return `lang-${lang}`;
  }

  private buildTopic(language: string, audience: string): string {
    const aud = `${this.audienceSeparator}${audience}`;
    return `${this.baseTopic}${this.langTopic(language)}${aud}`;
  }
}
