export default function permissoesUsuario(state = [], action) {
  // ////console.log(action);
  // if (action.sessao) {
  //   ////console.log('sessao ativa:'+action.sessao.token);
  // }
  switch (action.type) {
    case 'LOGIN': {
      return [...state, action.sessao];
    }
    default:
      return state;
  }
}
