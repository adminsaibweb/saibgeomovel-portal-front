import React, { Component } from "react"
import { Icon, Modal } from 'react-materialize';
import { getFromStorage } from "../../../../services/auth"
import api from "../../../../services/api"
import { ApprovalOfPaymentsContext } from "../../../../providers/approvalOfPayments"
import { Container, TitleModal, ActionsModal, Textarea } from "./styles"
import { alerta } from "../../../../services/funcoes";
import WaitScreen from "../../../../Components/Globals/WaitScreen";

class ModalConfirm extends Component {
  static contextType = ApprovalOfPaymentsContext
  state = {
    observation: '',
    loading: false
  }

  componentDidMount = async () => {
    this.setState({
      loading: true
    })
    await this.carregarVariaveisEstado();
    this.setState({
      loading: false
    })
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
      const { setUpdateDocument } = this.context 
      const { observation } = this.state
      let statusApproved = 2      
      let documents = []

      if (this.props.action === 0) {
        statusApproved = 0
      }

      if (this.props.othersDocuments) {
        this.props.document.DOCUMENTOS.map(element => {
          if (element.GSP_ID !== this.props.othersDocuments.GSP_ID) {
            if (element.GSP_FLG_APROVADO !== 1) {
              statusApproved = 1
            }
          }
          return null
        })

        documents.push(this.props.othersDocuments)
      } else {
        documents = this.props.document.DOCUMENTOS
      }

      const updateDocument = {
        GSB_ID: this.props.document.GSB_ID,
        GSB_FLG_APROVADO: statusApproved,
        GSA_OBSERVACAO: observation,
        DOCUMENTOS: documents.map(item => {
          let document = {}
          document.GSP_ID = item.GSP_ID
          if (this.props.action === 0) {
            document.GSP_FLG_APROVADO = 0
          } else {
            document.GSP_FLG_APROVADO = 1
          }
          document.GSA_OBSERVACAO = observation

          return document
        })
      }

      let { empresaAtiva, usuarioAtivo } = this.state

      const res = await api.put(`v1/approvalofpayments/setstatus/${empresaAtiva}/${usuarioAtivo}`, updateDocument, {
        params: {
          data_credito_incial: "",
          data_credito_final: "",
          forma_pagamento: "",
        }
      })
      if (res.data.sucess) {
        alerta("Documento alterado com sucesso!", 1)
        await setUpdateDocument()
        this.props.setOpenModalConfirm(false, 1)
      }
    } catch (error) {
      alerta("Erro em alterar status do documento", 2)
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
    const { modalConfirm, setOpenModalConfirm, document, action } = this.props
    return (
      <>
      <WaitScreen loading={loading} />
      <Modal
        className="modal-confirm-action"
        actions={[
          <ActionsModal>
            <button onClick={this.handleChangeStatusApproved}><Icon>done</Icon>Sim</button>
            <button onClick={() => setOpenModalConfirm(false, 2)}><Icon>cancel</Icon>Não</button>
          </ActionsModal>
        ]}
        bottomSheet={false}
        fixedFooter={false}
        id="modalConfirm"
        open={modalConfirm}
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
          <span>Documento Nº {document.GSP_DOCUMENTO ? document.GSP_DOCUMENTO : document.GSB_NR_DOCUMENTO} / Valor {document.GDP_VALOR ? document.GDP_VALOR : document.GSB_VALOR_TOTAL}</span>
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

export default ModalConfirm