import React, { Component } from 'react';
import { Linha, DivDetalhe, Labels } from '../style';
import { Icon, Collapsible, CollapsibleItem } from 'react-materialize';
import truckExclamation from '../../../../assets/images/truck-exclamation.png';
import truckChecked from '../../../../assets/images/truck-checked.png';
import { alerta } from '../../../../services/funcoes';
import './forced.css';
import M from 'materialize-css';
export default class ConfirmarFinalizar extends Component {
  state = {
    data: undefined,
  };

  componentDidMount = () => {
    //console.log('ConfirmarFinalizar1');
    //console.log(this.props);
    // let statusEntrega =
    //   this.props.data.statusEntrega !== undefined
    //     ? this.props.data.statusEntrega
    //     : 0;
    this.setState({ data: this.props.data });
  };

  finalizarEntrega = () => {
    let { data } = this.state;
    let valorPedido = Number(data.items[0].VALOR).toFixed(2);
    let valorAcertado = data.valorAcertado === undefined ? 0 :  Number(data.valorAcertado).toFixed(2);
    if (valorPedido !== valorAcertado){
      alerta('Verifique as divergências de valores em ACERTO.', 1);
      let abrirAcertos = M.Collapsible.getInstance(
        document.getElementsByClassName('_confirmarAcertos')[0]
      );

      if (abrirAcertos !== undefined){
        abrirAcertos.open();
      }

      let abrirFinalizar = M.Collapsible.getInstance(
        document.getElementsByClassName('_confirmarFinalizar')[0]
      );

      if (abrirFinalizar !== undefined){
        abrirFinalizar.close();
      }

      return;
    }

    if (data.items[0].produtos.find((prod) => {return (prod.PROD_EMB_1_ID != null && prod.PROD_EMB_1_QTDE_ENTREGUE_STATUS === undefined) || (prod.PROD_EMB_2_ID != null && prod.PROD_EMB_2_QTDE_ENTREGUE_STATUS === undefined)}) !== undefined){
      alerta('Verifique as divergências produtos RETORNÁVEIS.', 1);
      let abrirRetornaveis = M.Collapsible.getInstance(
        document.getElementsByClassName('_confirmarRetornavel')[0]
      );

      if (abrirRetornaveis !== undefined){
        abrirRetornaveis.open();
      }

      let abrirFinalizar = M.Collapsible.getInstance(
        document.getElementsByClassName('_confirmarFinalizar')[0]
      );

      if (abrirFinalizar !== undefined){
        abrirFinalizar.close();
      }

      return;

    }

    data.statusEntrega = 3;
    data.ENTREGUE = 1;
    this.setState({ data });
    this.props.onFinalizarEntrega(data);
    document.getElementsByClassName("modalCliente_"+data.CLI_ID)[0].click();
  };

  cancelarEntrega = () => {
    let { data } = this.state;
    data.statusEntrega = -2;
    this.setState({data });
    this.props.onUpdateItem(data);
  };

  handleMotivoNaoEntrega = (e) => {
    let { motivoNaoEntrega } = this.state;
    motivoNaoEntrega = e.target.value;
    this.setState({ motivoNaoEntrega });
  };

  handleCancelarNaoEntrega = () =>{
    let { data } = this.state;
    data.statusEntrega = 1;
    this.setState({ data });
    this.props.onUpdateItem(data);
  }

  handleConfirmarNaoEntrega = () =>{
    let { motivoNaoEntrega, data } = this.state;
    if (!motivoNaoEntrega){
      alerta('Informe o motivo de não entrega.', 1);
      return;
    }

    data.statusEntrega = -1;
    data.motivoNaoEntrega = motivoNaoEntrega;
    data.ENTREGUE = 1;
    this.setState({ data });
    this.props.onUpdateItem(data);
    document.getElementsByClassName("modalCliente_"+data.CLI_ID)[0].click();
  }
/*
{
  statusEntrega :
  -1 - Entrega cancelada
   0 - Pendente
   1 - Chegada confirmada
   2 - Retorno vasilhame confirmado
   3 - Entrega confirmada e acertada
}
 */

  render() {
    const { data, motivoNaoEntrega } = this.state;
    return (
      <Linha className="confirmarFinalizar" style={{ padding: '0px' }}>
        <Collapsible
          accordion={false}
          className="_confirmarFinalizar"
          style={{
            width: '100%',
            borderStyle: 'none',
            boxShadow: 'none',
          }}
        >
          <CollapsibleItem
            expanded={false}
            header={
              <>
                <span className="roundNumber">
                  {data !== undefined &&
                  data.items[0].produtos.find(
                    (_prod) =>
                      _prod.PROD_EMB_1_ID !== null ||
                      _prod.PROD_EMB_2_ID !== null
                  ) !== undefined
                    ? 4
                    : 3}
                </span>
                <h4>Finalizar</h4>
              </>
            }
            icon={<></>}
            node="div"
          >
            {/* <p>statusEntrega: {data !== undefined && data.statusEntrega}</p> */}
            <Linha style={{display: (data !== undefined && (data.statusEntrega === 3 || data.statusEntrega === -1)) ? 'flex': 'none', justifyContent: 'center'}}>
              <DivDetalhe style={{alignItems: 'center'}}>
              <img src={data !== undefined && data.statusEntrega === 3 ? truckChecked : truckExclamation} alt="Status Entrega" width={64} height={64}/>
              <Labels color="#bf1f7c" fontSize="1.5rem">{data !== undefined && data.statusEntrega === 3 ? "Entregue" : "Não entregue"}</Labels>
              </DivDetalhe>
            </Linha>
            <Linha style={{ padding: '12px', justifyContent: 'center' }}>
              <DivDetalhe>
                <button
                  className="waves-effect waves-light saib-button is-primary"
                  style={{ display: data !== undefined && (data.statusEntrega === 1 || data.statusEntrega === 2) ? 'flex' : 'none' }}
                  onClick={this.finalizarEntrega}
                >
                  Finalizar
                </button>
              </DivDetalhe>
              <DivDetalhe>
                <button
                  className="waves-effect waves-light saib-button is-secondary"
                  style={{
                    display:
                      data !== undefined && (data.statusEntrega === 1 || data.statusEntrega === 0 || data.statusEntrega === 2)
                        ? 'flex'
                        : 'none',
                  }}
                  onClick={this.cancelarEntrega}
                >
                  Cancelar
                </button>
              </DivDetalhe>
            </Linha>
            {data !== undefined && data.statusEntrega === -2 && (
              <>
                <Linha>
                  <DivDetalhe style={{ width: '100%' }}>
                    <Labels fontSize="0.9rem" fontWeight="700">
                      Motivo não entrega
                    </Labels>
                    <input
                      type="text"
                      onChange={this.handleMotivoNaoEntrega}
                      value={
                        motivoNaoEntrega !== undefined ? motivoNaoEntrega : ''
                      }
                    />
                  </DivDetalhe>
                </Linha>
                <Linha>
                <DivDetalhe style={{ width: '100%' }}>
                    <button
                      className={'waves-effect waves-light saib-button is-call-to-action confirmarNaoEntrega'}
                      onClick={this.handleConfirmarNaoEntrega}
                    >
                      <Icon>done_all</Icon>Confirmar não entrega
                    </button>
                  </DivDetalhe>
                  <DivDetalhe style={{ width: '100%' }}>
                    <button
                      className={'waves-effect waves-light saib-button is-primary cancelarNaoEntrega'}
                      onClick={this.handleCancelarNaoEntrega}
                    >
                      <Icon>cancel</Icon> Cancelar não entrega
                    </button>
                  </DivDetalhe>
                </Linha>
              </>
            )}
          </CollapsibleItem>
        </Collapsible>
      </Linha>
    );
  }
}
