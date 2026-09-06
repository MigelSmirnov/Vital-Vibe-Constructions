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

    this.id = id;
    this.phoneDisplay = phoneDisplay;
    this.phoneHref = phoneHref;
    this.whatsappUrl = whatsappUrl;
    this.email = email;
    this.mapUrl = mapUrl;
    this.mapLabel = mapLabel;
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
      legal_summary: this.legalSummary,
    });
  }
}
