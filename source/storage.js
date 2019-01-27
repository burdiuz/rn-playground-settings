import hasOwn from '@actualwave/has-own';

/*
  storage = {
    [entityType]: {
      [handlerType]: [
        handler1,
        handler2,
        handler3,
      ]
    }
  }

  each entity type has same set of handler types, but they are independent
  collections, i.e. handlers could be different
*/
export const initStorage = () => ({ entityTypes: {}, handlerTypes: {} });

const validateStorage = ({ entityTypes, handlerTypes }) =>
  Object.keys(handlerTypes).forEach((handlerType) => {
    const handlers = handlerTypes[handlerType];

    Object.keys(entityTypes).forEach((entityType) => {
      if (!hasOwn(handlers, entityType)) {
        handlers[entityType] = new Map();
      }
    });
  });

export const getStorageEntityTypes = ({ entityTypes }) => Object.keys(entityTypes);

export const assignEntityTypeToStorage = (storage, entityType) => {
  const { entityTypes } = storage;
  entityTypes[entityType] = true;
  validateStorage(storage);
};

export const getStorageHandlerTypes = ({ handlerTypes }) => Object.keys(handlerTypes);

export const assignHandlerTypeToStorage = (storage, handlerType) => {
  const { handlerTypes } = storage;
  const handlers = {};
  handlerTypes[handlerType] = handlers;
  validateStorage(storage);

  const get = (entityType, handlerName) => {
    const handlersMap = handlers[entityType];

    return handlersMap ? handlersMap.get(handlerName) : undefined;
  };

  const set = (handlerName, handler, ...entityTypes) => {
    Object.keys(handlers).forEach((entityType) => {
      if (!entityTypes.length || entityTypes.indexOf(entityType) >= 0) {
        handlers[entityType].set(handlerName, handler);
      }
    });
  };

  const forEach = (entityType, callback) => {
    const handlersMap = handlers[entityType];

    if (!handlersMap) {
      return;
    }

    handlersMap.forEach(callback);
  };

  async function forEachAsync(entityType, callback) {
    const handlersMap = handlers[entityType];

    if (!handlersMap) {
      return;
    }

    const entries = handlersMap.entries();

    let { value: entry, done } = entries.next();

    while (!done) {
      const [key, value] = entry;
      await callback(value, key, handlersMap);

      ({ value: entry, done } = entries.next());
    }
  }

  return {
    get,
    set,
    forEach,
    forEachAsync,
  };
};
