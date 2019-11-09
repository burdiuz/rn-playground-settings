import { initializeSettings, parseSettings, convertSettingsToRaw, handlers, settingsStorage } from './source';

const {
  applySettingHandler,
  fileHistory,
  directoryExpand,
  fileLock,
  gistTarget,
} = handlers;

const FILE = 'file';
const DIRECTORY = 'directory';

applySettingHandler(fileHistory, FILE);
applySettingHandler(fileLock, FILE);
applySettingHandler(directoryExpand, DIRECTORY);
applySettingHandler(gistTarget, FILE, DIRECTORY);
