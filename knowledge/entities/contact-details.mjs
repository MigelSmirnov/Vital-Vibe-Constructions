import { assertNonEmptyString, compactRecord } from "../core/entity-core.mjs";

export class ContactDetails {
  constructor({
    id,
    phoneDisplay,
    phoneHref,
    whatsappUrl,
    email,
    mapUrl,
    mapLabel,
    facebookUrl = null,
    address = null,
    legalSummary = null,
    source = null,
  }) {
    assertNonEmptyString(id, "id");
    assertNonEmptyString(phoneDisplay, "phoneDisplay");
    assertNonEmptyString(phoneHref, "phoneHref");
    assertNonEmptyString(whatsappUrl, "whatsappUrl");
    assertNonEmptyString(email, "email");
    assertNonEmptyString(mapUrl, "mapUrl");
    assertNonEmptyString(mapLabel, "mapLabel");
    if (legalSummary !== null) assertNonEmptyString(legalSummary, "legalSummary");

    if (facebookUrl !== null) {
      const url = new URL(facebookUrl);
      if (url.protocol !== "https:" || url.hostname !== "www.facebook.com" || url.pathname === "/" || url.username || url.password || url.search || url.hash) {
        throw new Error("Expected facebookUrl to be an HTTPS Facebook page URL.");
      }
    }

    this.id = id;
    this.phoneDisplay = phoneDisplay;
    this.phoneHref = phoneHref;
    this.whatsappUrl = whatsappUrl;
    this.email = email;
    this.mapUrl = mapUrl;
    this.mapLabel = mapLabel;
    if (address !== null) {
      // Service-area business: locality, region and country only, never a street address.
      if (typeof address !== "object" || Array.isArray(address) || Object.keys(address).some(key => !["locality", "region", "country"].includes(key))) {
        throw new Error("Expected address to contain only locality, region and country.");
      }
      assertNonEmptyString(address.locality, "address.locality");
      assertNonEmptyString(address.region, "address.region");
      if (!/^[A-Z]{2}$/.test(address.country)) throw new Error("Expected address.country to be an ISO 3166-1 alpha-2 code.");
    }

    this.facebookUrl = facebookUrl;
    this.address = address === null ? null : Object.freeze({ ...address });
    this.legalSummary = legalSummary;
    this.source = source;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected contact details record to be an object.");
    }

    return new ContactDetails({
      id: record.id,
      phoneDisplay: record.phone_display,
      phoneHref: record.phone_href,
      whatsappUrl: record.whatsapp_url,
      email: record.email,
      mapUrl: record.map_url,
      mapLabel: record.map_label,
      facebookUrl: record.facebook_url ?? null,
      address: record.address ?? null,
      legalSummary: record.legal_summary ?? null,
      source,
    });
  }

  toRecord() {
    return compactRecord({
      id: this.id,
      phone_display: this.phoneDisplay,
      phone_href: this.phoneHref,
      whatsapp_url: this.whatsappUrl,
      email: this.email,
      map_url: this.mapUrl,
      map_label: this.mapLabel,
      facebook_url: this.facebookUrl,
      address: this.address,
      legal_summary: this.legalSummary,
    });
  }
}
