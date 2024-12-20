import React, { Component } from 'react';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { alerta } from '../../../../services/funcoes';
import Dialog from '../../../../Components/Globals/Question';
import { Linha, DivDetalhe } from './styles';
import './forced.css';

class ApprovalOfVendorFundsSalesItems extends Component {
  state = {
    loading: true,
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    let pcfId = this.props.pcfId;

    this.setState({
      pcfId,
    });
    this.loadSalesItem();
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  loadSalesItem = async () => {
    const { empresaAtiva, pcfId } = this.state;
    try {
      let url;
      url = '/v1/brindes/resgate/itens/' + empresaAtiva + '/' + pcfId;
      //console.log(url);
      const retorno = await api.get(url);
      if (retorno.data && retorno.data.sucess) {
        const deliveryItemsList = retorno.data.data;
        //console.log(deliveryItemsList);
        this.setState({ deliveryItemsList });
      }
    } catch (err) {
      alerta('Erro ao carregar os resgates de brindes =>' + err, 2);
    }
  };

  setStatusSalesItem = async (status) => {
    const { empresaAtiva, pcfId } = this.state;
    try {
      let url;
      url = '/v1/brindes/resgate/itens/' + empresaAtiva + '/' + pcfId;
      let data = {
        status: status,
      };
      //   //console.log(url);
      const retorno = await api.put(url, data);
      //console.log(retorno);
      return retorno.data && retorno.data.sucess;
    } catch (err) {
      alerta('Erro ao atualizar o status da entrega dos bridnes =>' + err, 2);
    }
  };

  sendToApproved = async (statusOrigem, statusDestino) => {
    const statusChanged = await this.setStatusSalesItem(statusDestino);
    if (statusChanged) {
      let { pcfId } = this.state;
      this.props.onChangeStatus(pcfId, statusOrigem, statusDestino);
    }
  };

  sendToDenied = async (statusOrigem, statusDestino) =>{
    const statusChanged = await this.setStatusSalesItem(statusDestino);
    if (statusChanged) {
      let { pcfId } = this.state;
      this.props.onChangeStatus(pcfId, statusOrigem, statusDestino);
    }
  }

  sendToTransit = async (statusOrigem, statusDestino) =>{
    const statusChanged = await this.setStatusSalesItem(statusDestino);
    if (statusChanged) {
      let { pcfId } = this.state;
      this.props.onChangeStatus(pcfId, statusOrigem, statusDestino);
    }
  }

  sendTodenedSalesToApproval = async (statusOrigem, statusDestino) =>{
    const statusChanged = await this.setStatusSalesItem(statusDestino);
    if (statusChanged) {
      let { pcfId } = this.state;
      //console.log('pcfId');
      //console.log(pcfId);
      this.props.onChangeStatus(pcfId, statusOrigem, statusDestino );
    }
  }

  sendToDelivered = async (statusOrigem, statusDestino) =>{
    const statusChanged = await this.setStatusSalesItem(statusDestino);
    if (statusChanged) {
      let { pcfId } = this.state;
      //console.log('pcfId');
      //console.log(pcfId);
      this.props.onChangeStatus(pcfId, statusOrigem, statusDestino );
    }
  }

  render() {
    const { dfreFlgStatus, deliveryItemsList } = this.state;
    return (
      <>
        {dfreFlgStatus !== undefined && (
          <>
            {dfreFlgStatus === 0 && (
              <DivDetalhe style={{ width: '100%' }}>
                <Dialog
                  iconeBotaoPadrao={<></>}
                  classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                  textoBotaoPadrao="Separar >>"
                  titulo="Enviar entrega para separação?"
                  tituloBotaoSim="Sim"
                  classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                  tituloBotaoNao="Não"
                  classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                  message={
                    <>
                      <table className="deliveryItemsTable">
                        <tr>
                          <th>Cód.</th>
                          <th>Brinde</th>
                          <th>Qtde</th>
                        </tr>
                        {deliveryItemsList !== undefined &&
                          deliveryItemsList.map((delivery) => (
                            <tr key={delivery.DFRI_ID}>
                              <td>{delivery.DFRI_ID}</td>
                              <td>{delivery.DIFB_DESCRICAO}</td>
                              <td>{delivery.DFRI_QTDE}</td>
                            </tr>
                          ))}
                      </table>
                    </>
                  }
                  onNo={() => {}}
                  onYes={()=>this.sendToApproved(0,1)}
                />
              </DivDetalhe>
            )}
            {dfreFlgStatus === 1 && (
              <Linha style={{marginTop: '0px'}}>
                <DivDetalhe>
                  <Dialog
                    iconeBotaoPadrao={<></>}
                    classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                    textoBotaoPadrao="<< Espera"
                    titulo="Retornar para espera?"
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                    message={
                      <>
                        <table className="deliveryItemsTable">
                          <tr>
                            <th>Cód.</th>
                            <th>Brinde</th>
                            <th>Qtde</th>
                          </tr>
                          {deliveryItemsList !== undefined &&
                            deliveryItemsList.map((delivery) => (
                              <tr key={delivery.DFRI_ID}>
                                <td>{delivery.DFRI_ID}</td>
                                <td>{delivery.DIFB_DESCRICAO}</td>
                                <td>{delivery.DFRI_QTDE}</td>
                              </tr>
                            ))}
                        </table>
                      </>
                    }
                    onNo={() => {}}
                    onYes={()=>this.sendToDenied(1,0)}
                  />
                </DivDetalhe>
                <DivDetalhe>
                  <Dialog
                    iconeBotaoPadrao={<></>}
                    classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                    textoBotaoPadrao="Trânsito >>"
                    titulo="Enviar para em trânsito?"
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                    message={
                      <>
                        <table className="deliveryItemsTable">
                          <tr>
                            <th>Cód.</th>
                            <th>Brinde</th>
                            <th>Qtde</th>
                          </tr>
                          {deliveryItemsList !== undefined &&
                            deliveryItemsList.map((delivery) => (
                              <tr key={delivery.DFRI_ID}>
                                <td>{delivery.DFRI_ID}</td>
                                <td>{delivery.DIFB_DESCRICAO}</td>
                                <td>{delivery.DFRI_QTDE}</td>
                              </tr>
                            ))}
                        </table>
                      </>
                    }
                    onNo={() => {}}
                    onYes={()=>this.sendTodenedSalesToApproval(1,2)}
                  />
                </DivDetalhe>
              </Linha>
            )}
            {dfreFlgStatus === 2 && (
              <Linha style={{marginTop: '0px'}}>
                <DivDetalhe>
                  <Dialog
                    iconeBotaoPadrao={<></>}
                    classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                    textoBotaoPadrao="<< Separar"
                    titulo="Retornar para separação?"
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                    message={
                      <>
                        <table className="deliveryItemsTable">
                          <tr>
                            <th>Cód.</th>
                            <th>Brinde</th>
                            <th>Qtde</th>
                          </tr>
                          {deliveryItemsList !== undefined &&
                            deliveryItemsList.map((delivery) => (
                              <tr key={delivery.DFRI_ID}>
                                <td>{delivery.DFRI_ID}</td>
                                <td>{delivery.DIFB_DESCRICAO}</td>
                                <td>{delivery.DFRI_QTDE}</td>
                              </tr>
                            ))}
                        </table>
                      </>
                    }
                    onNo={() => {}}
                    onYes={()=>this.sendToApproved(2,1)}
                  />
                </DivDetalhe>
                <DivDetalhe>
                  <Dialog
                    iconeBotaoPadrao={<></>}
                    classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                    textoBotaoPadrao="Entregue >>"
                    titulo="Enviar para entrega?"
                    tituloBotaoSim="Sim"
                    classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close"
                    tituloBotaoNao="Não"
                    classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                    message={
                      <>
                        <table className="deliveryItemsTable">
                          <tr>
                            <th>Cód.</th>
                            <th>Brinde</th>
                            <th>Qtde</th>
                          </tr>
                          {deliveryItemsList !== undefined &&
                            deliveryItemsList.map((delivery) => (
                              <tr key={delivery.DFRI_ID}>
                                <td>{delivery.DFRI_ID}</td>
                                <td>{delivery.DIFB_DESCRICAO}</td>
                                <td>{delivery.DFRI_QTDE}</td>
                              </tr>
                            ))}
                        </table>
                      </>
                    }
                    onNo={() => {}}
                    onYes={()=>this.sendToDelivered(2,3)}
                  />
                </DivDetalhe>
              </Linha>
            )}
            {dfreFlgStatus === 3 && (
              <DivDetalhe style={{ width: '100%' }}>
                <Dialog
                  iconeBotaoPadrao={<></>}
                  classeBotaoPadrao="waves-effect waves-light saib-button is-secondary sendToApproved"
                  textoBotaoPadrao="Ver"
                  titulo="Items da entrega"
                  tituloBotaoSim="Sim"
                  classeBotaoSim="waves-effect waves-light saib-button is-primary modal-close hidden"
                  tituloBotaoNao="Fechar"
                  classeBotaoNao="waves-effect waves-light saib-button is-primary modal-close"
                  message={
                    <>
                      <table className="deliveryItemsTable">
                        <tr>
                          <th>Cód.</th>
                          <th>Brinde</th>
                          <th>Qtde</th>
                        </tr>
                        {deliveryItemsList !== undefined &&
                          deliveryItemsList.map((delivery) => (
                            <tr key={delivery.DFRI_ID}>
                              <td>{delivery.DFRI_ID}</td>
                              <td>{delivery.DIFB_DESCRICAO}</td>
                              <td>{delivery.DFRI_QTDE}</td>
                            </tr>
                          ))}
                      </table>
                    </>
                  }
                  onNo={() => {}}
                  onYes={()=>{}}
                />
              </DivDetalhe>
            )}
          </>
        )}
      </>
    );
  }
}

export default ApprovalOfVendorFundsSalesItems;
