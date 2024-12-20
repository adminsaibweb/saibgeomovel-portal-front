import { combineReducers } from 'redux';

import permissoesUsuario from './usuarios/reducer';
import logistics from './logistics/reducer';

export default combineReducers({
  permissoesUsuario,
  logistics,
});
