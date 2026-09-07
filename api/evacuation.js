import {SOURCES,parseEvacuation,makeHandler} from '../lib/arakawa.mjs';
export default makeHandler(SOURCES.evacuation,parseEvacuation);