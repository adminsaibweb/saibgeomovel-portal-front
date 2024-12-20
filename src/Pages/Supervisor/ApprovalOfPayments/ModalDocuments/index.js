import React, { Component } from "react"
import { Icon, Modal } from 'react-materialize';
import { currencyFormat } from "../../../../services/funcoes";
import ModalConfirm from "../ModalConfirm";
import api from "../../../../services/api"
import { alerta } from "../../../../services/funcoes";
import { ApprovalOfPaymentsContext } from "../../../../providers/approvalOfPayments";
import { getFromStorage } from "../../../../services/auth";
import { ActionsModal, TitleModal, Container, DataDocument, Table, ObservationActionDocument, LabelDetails, ContainerOthersDocuments, Card, LabelItem, TextArea, ObservationAction } from "./styles"
import "./forced.css"

class ModalDocuments extends Component {
  static contextType = ApprovalOfPaymentsContext
  state = {
    modalConfirm: false,
    documentConfirm: undefined,
    action: undefined,
    othersDocuments: undefined,
    array: undefined,
    activeButton: false
  }

  componentDidMount = async () => {
    let { array } = this.state
    array = this.props.paymentEdit
    await this.carregarVariaveisEstado()
    this.setState({
      array
    })
  }

  handleToModalConfirm = (value, idDocument, actionButton) => {
    let { documentConfirm, modalConfirm, action, othersDocuments } = this.state

    documentConfirm = this.props.paymentEdit

    if (idDocument) {
      othersDocuments = this.props.paymentEdit.DOCUMENTOS.find(item => item.GSP_ID === idDocument)
    }

    modalConfirm = value
    action = actionButton

    this.setState({
      othersDocuments,
      documentConfirm,
      modalConfirm,
      action
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

  handleActionModal = (value, action) => {
    this.setState({ modalConfirm: Boolean(value) })

    if (action === 1) {
      this.props.setOpenModal(Boolean(value))
    }
  }

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
        item.inputObservation = value
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
        GSA_OBSERVACAO: "Documentos analisados individualmente",
        DOCUMENTOS: this.state.array.DOCUMENTOS.map(item => {
          let document = {}
          document.GSP_ID = item.GSP_ID
          document.GSP_FLG_APROVADO = item.status
          document.GSA_OBSERVACAO = item.inputObservation

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

  render() {
    const { modalConfirm, documentConfirm, action, othersDocuments, array, activeButton } = this.state
    const { paymentEdit, openModal } = this.props
    return (
      <>
        {modalConfirm && <ModalConfirm document={documentConfirm} othersDocuments={othersDocuments} action={action} modalConfirm={modalConfirm} setOpenModalConfirm={(value, action) => { this.handleActionModal(value, action) }} />}

        <Modal
          className="modal-documents"
          actions={[
            <ActionsModal>
              {paymentEdit.GSB_FLG_APROVADO === -1 ? (<> <button onClick={() => this.handleToModalConfirm(true, undefined, 0)}><Icon tiny>block</Icon>Negar tudo</button>
                <button onClick={() => this.handleToModalConfirm(true, undefined, 1)}><Icon tiny>done</Icon>Aprovar tudo</button>
                <button disabled={!activeButton} onClick={this.handleSavedDocuments}><Icon tiny>save</Icon>Salvar</button>
                <button onClick={() => this.props.setOpenModal(false)}><Icon tiny>arrow_back</Icon>Voltar</button> </>)
                : <button onClick={() => this.props.setOpenModal(false)}><Icon tiny>arrow_back</Icon>Voltar</button>
              }

            </ActionsModal>
          ]}
          bottomSheet={false}
          fixedFooter={false}
          id="modalDocument"
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
            <span>Aprovação de pagamentos</span>
          </TitleModal>
          <Container>
            <DataDocument>
              <div className="titleBar"><Icon>description</Icon><h5>Dados do documento</h5></div>

              <Table>
                <tbody>
                  <tr>
                    <td>Nome</td>
                    <td>{paymentEdit.USR_NOME}</td>
                  </tr>
                  <tr>
                    <td>Tipo</td>
                    <td>{paymentEdit.GSB_FORMA_PAGAMENTO} Nº {paymentEdit.GSB_NR_DOCUMENTO}</td>
                  </tr>
                  <tr>
                    <td>Banco</td>
                    <td>{paymentEdit.GSB_BANCO}</td>
                  </tr>
                  <tr>
                    <td>Forma de pagamento</td>
                    <td>{paymentEdit.GSB_FORMA_PAGAMENTO}</td>
                  </tr>
                  <tr>
                    <td>Data de crédito</td>
                    <td>{paymentEdit.GSB_DTA_CREDITO}</td>
                  </tr>
                  <tr>
                    <td>Número documento</td>
                    <td>{paymentEdit.GSB_NR_DOCUMENTO}</td>
                  </tr>
                  <tr>
                    <td>Usuário</td>
                    <td>{paymentEdit.USR_NOME}</td>
                  </tr>
                  <tr>
                    <td>Observações</td>
                    <td>{paymentEdit.GSB_OBSERVACOES}</td>
                  </tr>
                </tbody>
              </Table>
              {paymentEdit.GSB_FLG_APROVADO !== -1 &&
                <ObservationActionDocument>
                  <label>Observações da ação</label>
                  <textarea disabled={true} value={paymentEdit.APROVACAO.OBSERVACAO} />
                </ObservationActionDocument>
              }
              <LabelDetails>
                <h5>Valor total</h5><span>{currencyFormat(paymentEdit.GSB_VALOR_TOTAL)}</span>
              </LabelDetails>

              <div className="titleBar"><Icon>dynamic_feed</Icon><h5>Todos documentos</h5></div>
              <ContainerOthersDocuments>
                {paymentEdit.DOCUMENTOS.map(document => (
                  <Card key={document.GSP_ID}>
                    <div className="title">
                      <h2>Documento {document.GSP_DOCUMENTO}</h2>
                    </div>

                    <LabelItem><strong>Valor documento: </strong><span style={{ fontWeight: "700"}}>{currencyFormat(document.GSP_VALOR)}</span></LabelItem>
                    <LabelItem><strong>Valor pagamento: </strong><span style={{ fontWeight: "700"}}>{currencyFormat(document.GSP_VALOR_PAGAMENTO)}</span></LabelItem>
                    <LabelItem><strong>Valor desconto: </strong><span style={{ fontWeight: "700"}}>{currencyFormat(document.GSP_VALOR_DESCONTO)}</span></LabelItem>
                    <LabelItem><strong>Valor juros/multa: </strong><span style={{ fontWeight: "700"}}>{currencyFormat(document.GSP_VALOR_JUROS)}</span></LabelItem>
                    <LabelItem><strong>Banco: </strong><span>{document.GSP_BANCO}</span></LabelItem>
                    <LabelItem><strong>Centro custos: </strong><span>{document.GSP_CENTRO_CUSTOS}</span></LabelItem>
                    <LabelItem><strong>Fornecedor: </strong><span>{document.GSP_FORNECEDOR}</span></LabelItem>
                    <LabelItem><strong>Data cadastro: </strong><span>{document.GSP_DTA_CADASTRO}</span></LabelItem>
                    <LabelItem><strong>Data vencimento: </strong><span>{document.GSP_DTA_VENCIMENTO}</span></LabelItem>
                    <LabelItem><strong>Tipo doc.: </strong><span>{document.GSP_TIPO_DOCUMENTO}</span></LabelItem>
                    <LabelItem><strong>Tipo pag.: </strong><span>{document.GSP_TIPO_PAGAMENTO}</span></LabelItem>
                    <LabelItem><strong>Observações: </strong><span>{document.GSP_OBSERVACOES}</span></LabelItem>

                    {!document.observation && document.GSP_FLG_APROVADO === -1 && <div className="buttons">
                      <button onClick={() => this.handleObservation(document.GSP_ID, true, 0)}><Icon tiny>block</Icon>Negar</button>
                      <button onClick={() => this.handleObservation(document.GSP_ID, true, 1)}
                      >
                        <Icon tiny>done</Icon>
                        Aprovar
                      </button>
                    </div>}
                    {document.GSP_FLG_APROVADO === 1 || document.GSP_FLG_APROVADO === 2 ?
                      <ObservationAction>
                        <div>
                          <label>Observações da ação</label>
                          <textarea disabled={true} value={document.APROVACAO.OBSERVACAO} />
                        </div>
                        <button className="approved">
                          <Icon tiny>done</Icon>
                          Aprovado
                        </button>
                      </ObservationAction>

                      : document.GSP_FLG_APROVADO !== -1 &&
                      <ObservationAction>
                        <div>
                          <label>Observações da ação</label>
                          <textarea disabled={true} value={document.APROVACAO.OBSERVACAO} />
                        </div>

                        <button className="denied">
                          <Icon tiny>block</Icon>
                          Negado
                        </button>
                      </ObservationAction>

                    }
                    {
                      array !== undefined &&
                      array.DOCUMENTOS.map(element => (
                        <React.Fragment key={element.GSP_ID}>
                          {
                            element.GSP_ID === document.GSP_ID && element.observation && (
                              <TextArea>
                                <label>Adicionar observação:</label>
                                <textarea
                                  value={element.inputObservation ? element.inputObservation : ""}
                                  onChange={(event) => this.handleInputObservation(event, document.GSP_ID)}
                                />
                                <button onClick={() => this.handleObservation(document.GSP_ID, false, document.GSP_FLG_APROVADO)}>
                                  <Icon tiny>close</Icon>
                                  Cancelar
                                </button>
                              </TextArea>
                            )
                          }
                        </React.Fragment>
                      ))

                    }

                  </Card>
                ))}
              </ContainerOthersDocuments>
            </DataDocument>
          </Container>

        </Modal>
      </>
    )
  }
}

export default ModalDocuments
