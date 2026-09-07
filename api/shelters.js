import {SOURCES,parseShelters,makeHandler} from '../lib/arakawa.mjs';
export default makeHandler(SOURCES.shelters,html=>({state:'ok',shelters:parseShelters(html),source:SOURCES.shelters}));