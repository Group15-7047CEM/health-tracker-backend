import { generateV4ReadSignedUrl } from './download-gcp.util';

// NOT REQUIRED ANYMORE (^deprecated)
export async function replaceWithSignedUrls(instances: any, columnNames: any) {
  return; // returning immediately as function is deprecated

  // instances is an array for the list view or an object for the detail view.
  if (!instances) {
    return;
  }
  if (Array.isArray(instances)) {
    const p = instances.map(async instance => {
      const c = columnNames.map(async columnName => {
        if (instance.dataValues[columnName]) {
          instance.dataValues[columnName] = await generateV4ReadSignedUrl(
            instance.getDataValue(columnName),
          );
        }
      });
      return Promise.all(c);
    });
    await Promise.all(p);
    return;
  } else {
    const p2 = columnNames.map(async columnName => {
      if (instances.dataValues[columnName]) {
        instances.dataValues[columnName] = await generateV4ReadSignedUrl(
          instances.getDataValue(columnName),
        );
      }
    });
    await Promise.all(p2);
    return;
  }
}
