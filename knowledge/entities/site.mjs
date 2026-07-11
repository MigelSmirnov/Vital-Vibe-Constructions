import { assertNonEmptyString } from "../core/entity-core.mjs";

export class Site {
  constructor({
    name,
    canonicalOrigin,
    defaultLanguage,
    title,
    description,
    serviceArea,
    hero,
    contact,
    source = null,
  }) {
    assertNonEmptyString(name, "name");
    assertNonEmptyString(canonicalOrigin, "canonicalOrigin");
    assertNonEmptyString(defaultLanguage, "defaultLanguage");
    assertNonEmptyString(title, "title");
    assertNonEmptyString(description, "description");
    assertNonEmptyString(serviceArea, "serviceArea");

    this.name = name;
    this.canonicalOrigin = canonicalOrigin;
    this.defaultLanguage = defaultLanguage;
    this.title = title;
    this.description = description;
    this.serviceArea = serviceArea;
    this.hero = Object.freeze(createHero(hero));
    this.contact = Object.freeze(createContact(contact));
    this.source = source;

    Object.freeze(this);
  }

  static fromRecord(record, source = null) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new Error("Expected site record to be an object.");
    }

    return new Site({ ...record, source });
  }

  toRecord() {
    return {
      name: this.name,
      canonicalOrigin: this.canonicalOrigin,
      defaultLanguage: this.defaultLanguage,
      title: this.title,
      description: this.description,
      serviceArea: this.serviceArea,
      hero: { ...this.hero },
      contact: { ...this.contact },
    };
  }
}

function createHero(hero) {
  if (!hero || typeof hero !== "object" || Array.isArray(hero)) {
    throw new Error("Expected site hero to be an object.");
  }

  assertNonEmptyString(hero.eyebrow, "hero.eyebrow");
  assertNonEmptyString(hero.title, "hero.title");
  assertNonEmptyString(hero.summary, "hero.summary");
  assertNonEmptyString(hero.image, "hero.image");
  assertNonEmptyString(hero.imageAlt, "hero.imageAlt");

  return {
    eyebrow: hero.eyebrow,
    title: hero.title,
    summary: hero.summary,
    image: hero.image,
    imageAlt: hero.imageAlt,
  };
}

function createContact(contact) {
  if (!contact || typeof contact !== "object" || Array.isArray(contact)) {
    throw new Error("Expected site contact to be an object.");
  }

  assertNonEmptyString(contact.heading, "contact.heading");
  assertNonEmptyString(contact.summary, "contact.summary");

  return {
    heading: contact.heading,
    summary: contact.summary,
  };
}
