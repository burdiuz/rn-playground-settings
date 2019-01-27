import { initStorage, assignEntityTypeToStorage, assignHandlerTypeToStorage } from './storage';

export const settingsStorage = initStorage();

export const registerSettingsEntityType = (entityType) =>
  assignEntityTypeToStorage(settingsStorage, entityType);

/*
  Convert raw object to settings objects, prepare data from file for usage
  parser(Object, settingName:String, fileType:String):Settings
*/
export const parsers = assignHandlerTypeToStorage(settingsStorage, 'parsers');

/*
  Convert settings data/objects to write into file, must return simple types
  consumable by JSON.stringify
  parser(Settings, settingName:String, fileType:String):Object
*/
export const toRawConverters = assignHandlerTypeToStorage(settingsStorage, 'toRawConverters');
/*
  Initializes settings objects when info object was created and no settings were
  stored or required setting is missing.
  initializer(settingName:String, fileType:String):Settings
*/
export const initializers = assignHandlerTypeToStorage(settingsStorage, 'initializers');

/*
  All parsers and converters should be treated as async functions
*/
export const createExportableSetting = (
  settingName,
  parser,
  toRawConverter,
  initializer = null,
  ...entityTypes
) => {
  parsers.set(settingName, parser, ...entityTypes);
  toRawConverters.set(settingName, toRawConverter, ...entityTypes);

  if (initializer) {
    initializers.set(settingName, initializer, ...entityTypes);
  }
};

export async function initializeSettings(entityType, entity) {
  const settings = {};

  async function handler(initializer, settingName) {
    settings[settingName] = await initializer(entity, entityType, settingName);
  }

  await initializers.forEachAsync(entityType, handler);

  return settings;
}

export async function parseSettings(entityType, entity, raw = {}) {
  const settings = {};

  async function handler(parser, settingName) {
    const { [settingName]: setting } = raw;

    if (setting === undefined) {
      const initializer = initializers.get(entityType, settingName);

      settings[settingName] = initializer
        ? await initializer(entity, entityType, settingName)
        : undefined;
    } else {
      settings[settingName] = await parser(setting, entity, entityType, settingName);
    }
  }

  await parsers.forEachAsync(entityType, handler);

  return settings;
}

export async function convertSettingsToRaw(entityType, entity, settings = {}) {
  const raw = {};

  async function handler(converter, settingName) {
    const { [settingName]: setting } = settings;

    raw[settingName] = await converter(setting, entity, entityType, settingName);
  }

  await toRawConverters.forEachAsync(entityType, handler);

  return raw;
}
