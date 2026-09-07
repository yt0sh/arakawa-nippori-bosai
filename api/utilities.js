import {SOURCES,parseUtilities,makeHandler} from '../lib/arakawa.mjs';
export default makeHandler(SOURCES.utilities,html=>({state:'ok',utilities:parseUtilities(html),source:SOURCES.utilities}));