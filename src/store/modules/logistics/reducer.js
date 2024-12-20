export default function logistics(state = [], action){
    // //console.log('*** DENTRO REDUCER ***');
    // //console.log('state');
    // //console.log(state);
    // //console.log('action');
    // //console.log(action);
    // //console.log('************************');
    switch (action.type) {
        case 'STORE': {
          return [action.state];
        }
        case 'ADDIMAGE': {
          // //console.log('ADDIMAGE');
          // //console.log('state');
          // //console.log(state);
          // //console.log('action');
          // //console.log(action);
          // //console.log('action.state');
          // //console.log(action.state);
          state[0].produtoSelecionado = action.state;
          return [state[0]];
        }
        default:
          return state;
      }
    
}