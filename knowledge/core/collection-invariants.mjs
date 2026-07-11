export function assertUniqueField(records, fieldName, collectionName) {
  const seen = new Map();

  for (const record of records) {
    const value = record[fieldName];

    if (value === null || value === undefined) {
      continue;
    }

    if (seen.has(value)) {
      throw new Error(
        `Duplicate ${collectionName} ${fieldName} "${value}" found in ${describeSource(seen.get(value))} and ${describeSource(record)}.`,
      );
    }

    seen.set(value, record);
  }
}

export function assertUniqueEntityKeys(records, collectionName) {
  assertUniqueField(records, "id", collectionName);
  assertUniqueField(records, "slug", collectionName);
}

function describeSource(record) {
  return record.source ?? record.id ?? "unknown source";
}
