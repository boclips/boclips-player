import URLTemplate from 'url-template';

export class Link {
  private link: RawLink;

  constructor(link: RawLink) {
    this.link = link;
  }

  public getOriginalLink() {
    return this.link.href;
  }

  public getTemplatedLink(paramKeysValues: {
    [paramName: string]: any;
  }): string {
    return URLTemplate.parse(this.link.href).expand(paramKeysValues);
  }

  public isTemplated(): boolean {
    return this.link.templated || false;
  }
}

export interface RawLink {
  href: string;
  templated?: boolean;
}
