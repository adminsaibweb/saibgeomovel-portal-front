import React, { Component } from "react"
import { Icon, Modal } from 'react-materialize';
import ConfirmAction from "../ConfirmAction";
import { currencyFormat } from "../../../../services/funcoes";
import api from "../../../../services/api"
import { alerta } from "../../../../services/funcoes";
import { getFromStorage } from "../../../../services/auth";
import { ActionsModal, ObservationAction, TitleModal, Container, TableOrder, Table, LabelDetails, TitleBar, ContainerDocuments, Card, TitleCard, ContentCard, LabelItem } from "./styles"
import "./forced.css"

class ModalItemsDetails extends Component {
  state = {
    modalConfirm: false,
    documentConfirm: undefined,
    action: undefined,
    othersDocuments: undefined,
    array: undefined,
    activeButton: false
  }

  componentDidMount = async () => {
    await this.carregarVariaveisEstado()
  }


  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };


  handleObservation = (idDocument, action, status) => {
    let { array, activeButton } = this.state

    activeButton = true

    array.DOCUMENTOS.map(element => {
      let item = element
      if (element.GSP_ID === idDocument) {
        item.observation = action
        item.status = status
      }
      if (element.GPS_ID !== idDocument && !element.observation) {
        activeButton = false
      }
      return item
    })

    if (!action) { activeButton = false }

    this.setState({
      array,
      activeButton
    })
  }

  handleInputObservation = (event, idDocument) => {
    let { array } = this.state
    const { value } = event.target;

    array.DOCUMENTOS.map(element => {
      let item = element
      if (element.GSP_ID === idDocument) {
        item.GSP_OBSERVACOES = value
      }
      return item
    })
    this.setState({
      array
    })
  };

  handleSavedDocuments = async () => {
    try {
      const { setUpdateDocument } = this.context
      let statusGeral = 2
      let checkedStatusDenied = 0
      let checkedStatusApproved = 0

      this.state.array.DOCUMENTOS.forEach(element => {
        if (element.status === 0) {
          statusGeral = 0
          checkedStatusDenied++
        } else {
          statusGeral = 2
          checkedStatusApproved++
        }
      });

      if (this.state.array.DOCUMENTOS.length !== checkedStatusDenied && this.state.array.DOCUMENTOS.length !== checkedStatusApproved) {
        statusGeral = 1
      }



      const updateDocument = {
        GSB_ID: this.props.paymentEdit.GSB_ID,
        GSB_FLG_APROVADO: statusGeral,
        GSA_OBSERVACAO: "OBSERVACAO SOBRE APROVACAO",
        DOCUMENTOS: this.state.array.DOCUMENTOS.map(item => {
          let document = {}
          document.GSP_ID = item.GSP_ID
          document.GSP_FLG_APROVADO = item.status
          document.GSA_OBSERVACAO = item.GSP_OBSERVACOES

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
        this.props.setOpenModal(false)
      }
    } catch (error) {
      alerta("Erro em atualizar os documentos", 2)
    }

  }

  handleActionModal = (value, action) => {
    this.setState({ modalConfirm: Boolean(value) })

    if (action === 1) {
      this.props.setOpenModal(Boolean(value))
    }
  }

  render() {
    const { modalConfirm, action } = this.state
    const { order, openModal } = this.props
    return (
      <>
        <ConfirmAction openModalAction={modalConfirm} order={order} action={action} setOpenModal={(value, action) => {
          this.handleActionModal(value, action)
        }} />
        <Modal
          className="modal-documents"
          actions={[
            <ActionsModal>
              {order.GOC_FLG_APROVADO === -1 ? (<>
                <button onClick={() => this.setState({ modalConfirm: true, action: 0 })}><Icon tiny>block</Icon>Negar</button>
                <button onClick={() => this.setState({ modalConfirm: true, action: 1 })}><Icon tiny>done</Icon>Aprovar</button>
                <button onClick={() => this.props.setOpenModal(false)}><Icon tiny>arrow_back</Icon>Voltar</button>
              </>
              ) : <button onClick={() => this.props.setOpenModal(false)}><Icon tiny>arrow_back</Icon>Voltar</button>}
            </ActionsModal>
          ]}
          bottomSheet={false}
          fixedFooter={false}
          id="modalItems"
          open={openModal}
          options={{
            dismissible: false,
            endingTop: '10%',
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
            <span>Fase de aprovação de ordem de compra</span>
          </TitleModal>
          <Container>
            <TableOrder>
              <TitleBar>
                <div>
                  <Icon>description</Icon><h5>Dados da ordem</h5>
                </div>
              </TitleBar>
              <Table>
                <tbody>
                  <tr>
                    <td>Fornecedor</td>
                    <td>{order.GOC_FORNECEDOR}</td>
                  </tr>
                  <tr>
                    <td>Nº do pedido</td>
                    <td>{order.GOC_NUMERO}</td>
                  </tr>
                  <tr>
                    <td>Tipo</td>
                    <td>{order.GOC_TIPO}</td>
                  </tr>
                  <tr>
                    <td>Data da ordem</td>
                    <td>{order.GOC_DTA_ORDEM}</td>
                  </tr>
                  <tr>
                    <td>Previsão de entrega</td>
                    <td>{order.GOC_DTA_PREVISAO}</td>
                  </tr>
                  <tr>
                    <td>Valor</td>
                    <td>{currencyFormat(order.GOC_VALOR)}</td>
                  </tr>
                  <tr>
                    <td>Observações</td>
                    <td>{order.GOC_OBSERVACOES}</td>
                  </tr>
                </tbody>
              </Table>
              {order.GOC_FLG_APROVADO !== -1 &&
                <ObservationAction>
                  <label>Observações sobre ação</label>
                  <textarea disabled={true} value={order.APROVACAO.OBSERVACAO} />
                </ObservationAction>
              }
              <LabelDetails>
                <h5>Valor total</h5><span>{currencyFormat(order.GOC_VALOR)}</span>
              </LabelDetails>
            </TableOrder>
            <TitleBar>
              <div>
                <Icon>shopping_basket</Icon>
                <h5>Itens da ordem</h5>
              </div>
            </TitleBar>
            <ContainerDocuments>
              {order.ITENS.map(element => (
                <Card key={element.GOI_ID}>
                  <TitleCard>
                    <h2>{element.GOI_PROD_DESCRICAO}</h2>
                  </TitleCard>
                  <ContentCard>
                    <LabelItem><strong>Estoque: </strong><span>{element.GOI_ESTOQUE_ATUAL}</span></LabelItem>
                    <LabelItem><strong>Cod. Produto: </strong><span>{element.GOI_PROD_CODIGO}</span></LabelItem>
                    <LabelItem><strong>Nome: </strong><span>{element.GOI_PROD_DESCRICAO}</span></LabelItem>
                    <LabelItem><strong>Unidade: </strong><span>{element.GOI_PROD_UNIDADE}</span></LabelItem>
                    <LabelItem><strong>Quantidade: </strong><span>{element.GOI_QUANTIDADE}</span></LabelItem>
                    <LabelItem><strong>Valor unitário: </strong><span>{currencyFormat(element.GOI_VALOR_UNITARIO)}</span></LabelItem>
                    <LabelItem><strong>Custo médio: </strong><span>{currencyFormat(element.GOI_CUSTO_MEDIO)}</span></LabelItem>
                    <LabelItem><strong>Custo atual: </strong><span>{currencyFormat(element.GOI_CUSTO_ATUAL)}</span></LabelItem>
                    <LabelItem><strong>Estoque atual: </strong><span>{element.GOI_ESTOQUE_ATUAL}</span></LabelItem>
                    <LabelItem><strong>Observações: </strong><span>{element.GOI_OBSERVACAO}</span></LabelItem>
                  </ContentCard>
                </Card>
              ))}
            </ContainerDocuments>
          </Container>
        </Modal>
      </>
    )
  }
}

export default ModalItemsDetails