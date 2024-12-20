import React, { Component } from "react"
import { Icon, Modal } from 'react-materialize';
import { getFromStorage } from "../../../../services/auth"
import api from "../../../../services/api"
import { alerta, currencyFormat } from "../../../../services/funcoes";
import WaitScreen from "../../../../Components/Globals/WaitScreen";
import { ApprovalOfPurchaseOrderContext } from "../../../../providers/approvalOfPurchaseOrder";
import { Container, TitleModal, ActionsModal, Textarea } from "./styles"
import "./forced.css"

class ConfirmAction extends Component {
  static contextType = ApprovalOfPurchaseOrderContext
  state = {
    observation: '',
    loading: false
  }

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  handleChangeStatusApproved = async () => {
    this.setState({
      loading: true
    })

    try {
      const { observation, empresaAtiva, usuarioAtivo } = this.state
      const { setUpdateOrder } = this.context

      const updateOrder = {
        GOC_ID: this.props.order.GOC_ID,
        GOA_FLG_APROVADO: this.props.action,
        GOA_OBSERVACAO: observation
      }
      
      const res = await api.put(`v1/approvalofpurchaseorder/setstatus/${empresaAtiva}/${usuarioAtivo}`, updateOrder, {
        params: {
          data_credito_incial: "",
          data_credito_final: "",
          forma_pagamento: "",
        }
      })
      
      if (res.data.sucess) {
        this.props.setOpenModal(false, 1)
        await setUpdateOrder()
        alerta("Pedido alterado com sucesso", 1)
      }
    } catch (error) {
      alerta("Erro ao atualizar a ordem", 2)
    }

    this.setState({
      loading: false
    })
  }

  handleInputObservation = event => {
    const { value } = event.target;
    this.setState({ observation: String(value) });
  };

  render() {
    const { loading } = this.state
    const { openModalAction, setOpenModal, action, order } = this.props
    return (
      <>
      <WaitScreen loading={loading} />
      <Modal
        className="modal-confirm-action"
        actions={[
          <ActionsModal>
            <button onClick={this.handleChangeStatusApproved}><Icon>done</Icon>Sim</button>
            <button onClick={() => setOpenModal(false, 2)}><Icon>cancel</Icon>Não</button>
          </ActionsModal>
        ]}
        bottomSheet={false}
        fixedFooter={false}
        id="openModalAction"
        open={openModalAction}
        options={{
          dismissible: false,
          endingTop: '20%',
          inDuration: 250,
          onCloseEnd: null,
          onCloseStart: null,
          onOpenEnd: null,
          onOpenStart: null,
          opacity: 0.5,
          outDuration: 250,
          preventScrolling: true,
          startingTop: '0',
        }}
        root={document.body}
      >

        <TitleModal>
          <span>Pedido {order.GOC_NUMERO} / Valor {currencyFormat(order.GOC_VALOR)}</span>
        </TitleModal>
        <Container>
          {action === 0 ? <h2>Deseja confirmar a ação de <strong>negar</strong>?</h2> : <h2>Deseja confirmar a ação de <strong>aprovar</strong>?</h2>}
          
          <div className="textarea">
          <label>Adicionar observações:</label>
          <Textarea          
            value={this.state.observation}
            onChange={this.handleInputObservation}
            autocapitalize={false}
          ></Textarea>
          </div>
        </Container>

      </Modal>
      </>
    )
  }
}

export default ConfirmAction