export class CNotifyTopicStorage {
  private readonly topicsKey = 'cnotify_subscribed_topics';

  public getSubscribedTopics(): string[] {
    // Get topics from localStorage
    const topicsJson = localStorage.getItem(this.topicsKey);
    return topicsJson ? JSON.parse(topicsJson) : [];
  }

  public persistSubscribedTopics(topics: string[]): void {
    // Persist topics
    // Use localStorage to store the topics
    localStorage.setItem(this.topicsKey, JSON.stringify(topics));
  }
}
