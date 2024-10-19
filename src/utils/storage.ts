export class MetadataStorage {
  private readonly metadataKey = 'cnotify_subscribed_metadata';

  public getSubscribedMetadata(): object | null {
    // Get metadata from localStorage
    const metadataJson = localStorage.getItem(this.metadataKey);
    return metadataJson ? JSON.parse(metadataJson) : null;
  }

  public persistSubscribedMetadata(metadata: object): void {
    // Persist metadata
    // Use localStorage to store the metadata
    localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
  }
}
