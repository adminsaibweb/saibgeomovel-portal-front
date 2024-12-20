import React, { Component, forwardRef } from "react"
import Header from "../../../Components/System/Header"
import WaitScreen from "../../../Components/Globals/WaitScreen"
import DirectTituloJanela from "../../../Components/Globals/DirectTituloJanela"
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';
import SelectQuery from "../../../Components/Globals/SelectQuery";
import CardItem from "./CardItem";
import ModalDocuments from "./ModalDocuments"
import { Icon, Collapsible, CollapsibleItem, Pagination } from 'react-materialize';
import DatePicker from "react-datepicker"
import ptBR from 'date-fns/locale/pt-BR';
import moment from "moment"
import api from "../../../services/api"
import { getFromStorage } from '../../../services/auth';
import InputMask from 'react-input-mask';
import { formatOracleDateToBr, alerta } from "../../../services/funcoes";
import ApprovalOfPaymentsProvider, { ApprovalOfPaymentsContext } from "../../../providers/approvalOfPayments"

import {
  Container,
  Content,
  ContainerDatas,
  DataFilter,
  ContainerSelectedPayment,
  ContainerCodPayment,
  InputCod,
  ContainerStatus,
  ButtonFiltered,
  ContainerInfos,
  Kanban,
  DivContentKanban,
  KanbanContent,
  ContainerPagination
} from "./styles"

const CustomCalendarInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '110px',
      justifyContent: 'space-between',
      borderBottom: '1px solid #ccc',
    }}
  >
    <InputMask
      style={{ width: '90px' }}
      mask="99/99/9999"
      value={value}
      maskChar={null}
      onChange={onChange}
    />
    <span
      onClick={onClick}
      style={{ cursor: 'pointer', color: 'rgb(97, 9, 138)' }}
    >
      <Icon>date_range</Icon>
    </span>
  </div>
));

class ApprovalOfPaymentsComponent extends Component {
  static contextType = ApprovalOfPaymentsContext
  state = {
    customSelectedInitial: new Date(moment().startOf('year')),
    customSelectedEnd: new Date(moment().endOf('year')),
    formPaymentSelected: undefined,
    codPaymentSelected: "",
    statusSelected: undefined,

    loadingFilter: 0,
    loading: false,
    openModal: false,
    updateDocument: false,

    allData: undefined,
    allDataForFilter: undefined,
    allPayments: [],
    paymentsNotPay: undefined,
    paymentsApproved: undefined,
    paymentsPartiallyApproved: undefined,
    paymentsDenied: undefined,

    paymentEdit: undefined,
    formPayment: undefined,

    itemsPage: 3,
  };

  componentDidMount = async () => {
    this.setState({
      loading: true
    })
    await this.carregarVariaveisEstado();
    await this.handleAllData()
    await this.handleFormPayment()
    this.setState({
      loading: false
    })
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { updateDocument } = this.context
    if (this.state.updateDocument !== updateDocument) {
      this.setState({
        updateDocument
      })
      await this.carregarVariaveisEstado();
      await this.handleAllData()
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  handleAllData = async () => {
    try {
      let { empresaAtiva, usuarioAtivo, allData } = this.state

      const res = await api.get(`v1/approvalofpayments/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data_credito_incial: "",
          data_credito_final: "",
          forma_pagamento: "",
        }
      })
      allData = res.data.data
      this.handleFilterTypes(allData)

      this.setState({
        allData
      })
    } catch (error) {
      alerta("Erro em buscar os dados", 2)
    }
  }

  handleFilterTypes = (allData) => {
    let { paymentsNotPay,
      paymentsApproved, paymentsPartiallyApproved, paymentsDenied } = this.state

    let arrayNotPay = []
    let arrayApproved = []
    let arrayPartially = []
    let arrayDenied = []

    allData.map(item => {
      if (item.GSB_FLG_APROVADO === -1) {
        arrayNotPay.push(item)
      } else if (item.GSB_FLG_APROVADO === 1) {
        let valuePartially = 0
        item.DOCUMENTOS.map(element => {
          if (element.GSP_FLG_APROVADO === 1) {
            valuePartially += element.GSP_VALOR
          }
          return null
        })
        item.VALUE_PARTIALLY = valuePartially

        arrayPartially.push(item)
      } else if (item.GSB_FLG_APROVADO === 2) {
        arrayApproved.push(item)
      } else if (item.GSB_FLG_APROVADO === 0) {
        arrayDenied.push(item)
      }

      return null
    })

    paymentsNotPay = arrayNotPay
    paymentsApproved = arrayApproved
    paymentsPartiallyApproved = arrayPartially
    paymentsDenied = arrayDenied

    this.setState({
      paymentsNotPay,
      paymentsApproved,
      paymentsPartiallyApproved,
      paymentsDenied
    }, async () => await this.handleCreatePagination())
  }

  handleCreatePagination = async () => {
    let { paymentsNotPay,
      paymentsApproved, paymentsPartiallyApproved, paymentsDenied, itemsPage, allPayments } = this.state

    let arrayWaitApproved
    let arrayAuxApproved
    let arrayAuxPartiallyApproved
    let arrayAuxDenied

    arrayWaitApproved = paymentsNotPay.map(item => {
      let paymentsNotApproved = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of paymentsNotPay) {
        if (count <= itemsPage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        paymentsNotApproved.push(element);
        count++;
      }

      let quantityPages =
        Number(paymentsNotApproved.length) !== 0 ? this.calculatePagination(Number(paymentsNotApproved.length), itemsPage) : 1;

      return { paymentsNotApproved, quantityPages, pagesActual };
    });

    arrayAuxApproved = paymentsApproved.map(item => {
      let arrayApproved = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of paymentsApproved) {
        if (count <= itemsPage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        arrayApproved.push(element);
        count++;
      }

      let quantityPages =
        Number(arrayApproved.length) !== 0 ? this.calculatePagination(Number(arrayApproved.length), itemsPage) : 1;

      return { arrayApproved, quantityPages, pagesActual };
    });

    arrayAuxPartiallyApproved = paymentsPartiallyApproved.map(item => {
      let arrayPartiallyApproved = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of paymentsPartiallyApproved) {
        if (count <= itemsPage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        arrayPartiallyApproved.push(element);
        count++;
      }

      let quantityPages =
        Number(arrayPartiallyApproved.length) !== 0 ? this.calculatePagination(Number(arrayPartiallyApproved.length), itemsPage) : 1;

      return { arrayPartiallyApproved, quantityPages, pagesActual };
    });

    arrayAuxDenied = paymentsDenied.map(item => {
      let arrayDenied = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of paymentsDenied) {
        if (count <= itemsPage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        arrayDenied.push(element);
        count++;
      }

      let quantityPages =
        Number(arrayDenied.length) !== 0 ? this.calculatePagination(Number(arrayDenied.length), itemsPage) : 1;

      return { arrayDenied, quantityPages, pagesActual };
    });

    allPayments[0] = arrayWaitApproved[0] ? arrayWaitApproved[0] : { arrayWaitApproved: undefined }
    allPayments[1] = arrayAuxApproved[0] ? arrayAuxApproved[0] : { arrayAuxApproved: undefined }
    allPayments[2] = arrayAuxPartiallyApproved[0] ? arrayAuxPartiallyApproved[0] : { arrayAuxPartiallyApproved: undefined }
    allPayments[3] = arrayAuxDenied[0] ? arrayAuxDenied[0] : { arrayAuxDenied: undefined }


    await this.setState({
      allPayments
    })
  }

  calculatePagination = (length, itemPage) => {
    let quantityPages = length / itemPage;

    if (length % itemPage !== 0) {
      quantityPages = Math.trunc(quantityPages) < 1 ? undefined : Math.trunc(quantityPages) + 1;
    } else {
      quantityPages = Math.trunc(quantityPages) === 1 ? undefined : Math.trunc(quantityPages);
    }
    if (quantityPages === undefined) {
      quantityPages = 1;
    }
    return quantityPages;
  };

  paginationSelected = (position, index) => {
    const { allPayments } = this.state
    allPayments[index].pagesActual = Number(position);

    this.setState({ allPayments });
  };

  handleFormPayment = async () => {
    try {
      let { empresaAtiva, usuarioAtivo, formPayment } = this.state

      const res = await api.get(`v1/approvalofpayments/filters/${empresaAtiva}/${usuarioAtivo}`)

      formPayment = res.data.data.FORMA_PAGAMENTO.map((item, index) => {
        let namePayment = {}
        namePayment.namePayment = item
        namePayment.labelOfApresentation = `${index} - ${item}`
        return namePayment
      })

      this.setState({
        formPayment
      })
    } catch (error) {
      alerta("Erro em buscar as formas de pagamento", 2)
    }
  }

  handleToModal = async (value, action, idPayment) => {
    let { paymentEdit, allData } = this.state
    paymentEdit = allData.find(item => item.GSB_ID === idPayment)

    if (action === 0) {
      this.setState({
        loading: true
      })
      try {
        const { setUpdateDocument } = this.context
        const updateDocument = {
          GSB_ID: paymentEdit.GSB_ID,
          GSB_FLG_APROVADO: -1,
          GSA_OBSERVACAO: "Voltando para aprovação",
          DOCUMENTOS: paymentEdit.DOCUMENTOS.map(item => {
            let document = {}
            document.GSP_ID = item.GSP_ID
            document.GSP_FLG_APROVADO = -1
            document.GSA_OBSERVACAO = "Voltando para aprovação"

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
        }
      } catch (error) {
        alerta("Erro em alterar o documento!", 2)
      }

      this.setState({
        loading: false
      })

    } else {
      this.setState({
        paymentEdit,
        openModal: value
      })
    }

  }

  handleLoadCustomDataInitial = value => {
    let { customSelectedInitial } = this.state
    customSelectedInitial = value

    this.setState({
      customSelectedInitial
    })
  };

  handleLoadCustomDataEnd = value => {
    let { customSelectedEnd } = this.state
    customSelectedEnd = value

    this.setState({
      customSelectedEnd
    })
  };

  filterChangeStatus = value => {
    let { statusSelected } = this.state
    statusSelected = value

    this.setState({
      statusSelected
    })
  }

  handleFilterFormPayment = async event => {
    let { formPaymentSelected } = this.state
    const value = event ? event.namePayment : undefined;
    formPaymentSelected = value

    this.setState({
      formPaymentSelected
    })
  };

  handleCodPayment = async event => {
    let { codPaymentSelected } = this.state
    const {value} = event.target ? event.target : undefined;
    codPaymentSelected = value

    this.setState({
      codPaymentSelected
    })
  };

  runFilters = async () => {
    const { empresaAtiva, usuarioAtivo, customSelectedInitial, customSelectedEnd, formPaymentSelected, statusSelected, codPaymentSelected } = this.state

    try {
      this.setState({
        loading: true
      })
      let dataInitial = formatOracleDateToBr(new Date(formatOracleDateToBr(customSelectedInitial).split(" ", 1).toString().split(' ', 1).toString().split('/').reverse().join('/')))
      let dataEnd = formatOracleDateToBr(new Date(formatOracleDateToBr(customSelectedEnd).split(" ", 1).toString().split(' ', 1).toString().split('/').reverse().join('/')))

      const res = await api.get(`v1/approvalofpayments/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data_credito_inicial: dataInitial,
          data_credito_final: dataEnd,
          forma_pagamento: formPaymentSelected,
          status_aprovacao: statusSelected === 3 ? "" : statusSelected,
          codigo_pagamento: codPaymentSelected
        }
      })

      if (res.data.data.length === 0) {
        alerta("Nenhum dado com o filtro selecionado", 2)
      }
      this.handleFilterTypes(res.data.data)
      this.setState({
        loading: false
      })
    } catch (error) {
      alerta("Erro ao filtrar dados", 2)
    }
  }

  render() {
    const { loading, customSelectedInitial, customSelectedEnd, loadingFilter, allPayments, paymentEdit, formPayment } = this.state
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>payments</Icon>Aprovação de pagamentos
                </span>
              )
            }
          />
          {this.state.openModal && paymentEdit !== undefined && <ModalDocuments paymentEdit={paymentEdit} openModal={this.state.openModal} setOpenModal={value => {
            this.setState({ openModal: Boolean(value) });
          }} />}

          <Collapsible>
            <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
              <Content>

                <ContainerDatas>
                  <h5>Data de crédito</h5>
                  <DataFilter loading={loadingFilter ? 1 : 0}>
                    <div>
                      <h5>Data inicial</h5>
                      <DatePicker
                        selected={customSelectedInitial}
                        onChange={this.handleLoadCustomDataInitial}
                        selectsStart
                        startDate={customSelectedInitial}
                        locale={ptBR}
                        placeholderText="Data inicial"
                        dateFormat="dd/MM/yyyy"
                        customInput={<CustomCalendarInput />}
                      />
                    </div>
                    <div>
                      <h5>Data final</h5>
                      <DatePicker
                        selected={customSelectedEnd}
                        onChange={this.handleLoadCustomDataEnd}
                        startDate={customSelectedInitial}
                        minDate={customSelectedInitial}
                        locale={ptBR}
                        placeholderText="Data final"
                        dateFormat="dd/MM/yyyy"
                        customInput={<CustomCalendarInput />}
                      />
                    </div>
                  </DataFilter>
                </ContainerDatas>

                <ContainerSelectedPayment>
                  <h5>
                    Forma de pagamento
                  </h5>
                  <SelectQuery
                    loading={false}
                    colorPrimary
                    query={formPayment}
                    keys={['namePayment']}
                    label="labelOfApresentation"
                    onSelect={(item) => {
                      this.handleFilterFormPayment(item);
                    }}
                    onDelete={() => {
                      this.handleFilterFormPayment(null);
                    }}
                  />
                </ContainerSelectedPayment>

                <ContainerCodPayment>
                  <h5>Código pagamento</h5>
                  <InputCod value={this.state.codPaymentSelected} onChange={(value) => this.handleCodPayment(value)} />
                </ContainerCodPayment>

                <ContainerStatus>
                  <h5>Status pagamento</h5>
                  <SaibRadioGroup
                    valueItems={'"-1", "2", "1", "0", "3"'}
                    classNameItems={
                      '"notPay", "paid", "partiallyPay", "denied", "allItem"'
                    }
                    textItems={
                      '"Esperando","Aprovados", "Parcialmente", "Negados", "Todos"'
                    }
                    idItems={
                      '"itemNotPay","itemPaid", "itemPartiallyPay", "itemDenied", "itemAllItems"'
                    }
                    classNameRadio="FilterStatusPayment"
                    flexDirectionRadio="row"
                    disabledRadio="false"
                    captionRadio=""
                    defaultCheckedId={'itemAllItems'}
                    onChange={value => {
                      this.filterChangeStatus(parseInt(value));
                    }}
                  />
                </ContainerStatus>

                <ButtonFiltered>
                  <button onClick={this.runFilters}><Icon tiny>filter_alt</Icon>Filtrar</button>
                </ButtonFiltered>

              </Content>
            </CollapsibleItem>
          </Collapsible>

          <ContainerInfos>
            <Kanban color={"#8870A4"}>
              <div className="titleContainer">
                <span>:: Esperando aprovação</span>
              </div>

              <DivContentKanban color={"rgba(136,112,164,0.3)"}>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.paymentsNotApproved !== undefined &&
                        payment.paymentsNotApproved.map((element, index) => (
                          <React.Fragment key={index}>
                            {element.page === payment.pagesActual && (
                              <KanbanContent key={element.GSB_ID}>
                                <CardItem key={element.GSB_ID}
                                  nameBank={element.GSB_BANCO}
                                  typeDocument={element.GSB_FORMA_PAGAMENTO}
                                  paymentForm={element.GSB_FORMA_PAGAMENTO}
                                  userName={element.USR_NOME}
                                  nrCheque={element.GSB_NR_DOCUMENTO}
                                  nrDocument={element.GSB_NR_DOCUMENTO}
                                  dateCredit={element.GSB_DTA_CREDITO}
                                  valueTotal={element.GSB_VALOR_TOTAL}
                                  status={element.GSB_FLG_APROVADO}
                                  setOpenModal={async (value, action) => {
                                    await this.handleToModal(value, action, element.GSB_ID)
                                  }}
                                />
                              </KanbanContent>
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
              </DivContentKanban>

              {allPayments.length !== 0 &&
                allPayments.map((element, index) => (
                  <React.Fragment key={index}>
                    {element.paymentsNotApproved !== undefined && element.quantityPages !== 1 && (
                      <ContainerPagination>
                        <Pagination
                          activePage={element.pagesActual}
                          items={element.quantityPages}
                          leftBtn={<Icon>chevron_left</Icon>}
                          maxButtons={5}
                          rightBtn={<Icon>chevron_right</Icon>}
                          onSelect={position => {
                            this.paginationSelected(position, index);
                          }}
                        />
                      </ContainerPagination>

                    )}

                  </React.Fragment>
                ))}
            </Kanban>

            <Kanban color={"#08703E"}>
              <div className="titleContainer">
                <span>:: Aprovados</span>
              </div>
              <DivContentKanban color={"rgba(8,112,62,0.3)"}>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.arrayApproved !== undefined &&
                        payment.arrayApproved.map((element, index) => (
                          <React.Fragment key={index}>
                            {element.page === payment.pagesActual && (
                              <KanbanContent key={element.GSB_ID}>
                                <CardItem key={element.GSB_ID}
                                  nameBank={element.GSB_BANCO}
                                  typeDocument={element.GSB_FORMA_PAGAMENTO}
                                  paymentForm={element.GSB_FORMA_PAGAMENTO}
                                  userName={element.USR_NOME}
                                  nrCheque={element.GSB_NR_DOCUMENTO}
                                  nrDocument={element.GSB_NR_DOCUMENTO}
                                  dateCredit={element.GSB_DTA_CREDITO}
                                  valueTotal={element.GSB_VALOR_TOTAL}
                                  valuePartially={element.VALUE_PARTIALLY}
                                  status={element.GSB_FLG_APROVADO}
                                  setOpenModal={async (value, action) => {
                                    await this.handleToModal(value, action, element.GSB_ID)
                                  }}
                                />
                              </KanbanContent>
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}

              </DivContentKanban>
              <ContainerPagination>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.arrayApproved !== undefined && payment.quantityPages !== 1 && (
                        <Pagination
                          activePage={payment.pageActual}
                          items={payment.quantityPages}
                          leftBtn={<Icon>chevron_left</Icon>}
                          maxButtons={5}
                          rightBtn={<Icon>chevron_right</Icon>}
                          onSelect={position => {
                            this.paginationSelected(position, index);
                          }}
                        />
                      )}

                    </React.Fragment>
                  ))}
              </ContainerPagination>
            </Kanban>


            <Kanban color={"#4298E8"}>
              <div className="titleContainer">
                <span>:: Parcialmente aprovados</span>
              </div>
              <DivContentKanban color={"rgba(66,152,232,0.3)"}>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.arrayPartiallyApproved !== undefined &&
                        payment.arrayPartiallyApproved.map((element, index) => (
                          <React.Fragment key={index}>
                            {element.page === payment.pagesActual && (
                              <KanbanContent key={element.GSB_ID}>
                                <CardItem key={element.GSB_ID}
                                  nameBank={element.GSB_BANCO}
                                  typeDocument={element.GSB_FORMA_PAGAMENTO}
                                  paymentForm={element.GSB_FORMA_PAGAMENTO}
                                  userName={element.USR_NOME}
                                  nrCheque={element.GSB_NR_DOCUMENTO}
                                  nrDocument={element.GSB_NR_DOCUMENTO}
                                  dateCredit={element.GSB_DTA_CREDITO}
                                  valueTotal={element.GSB_VALOR_TOTAL}
                                  valuePartially={element.VALUE_PARTIALLY}
                                  status={element.GSB_FLG_APROVADO}
                                  setOpenModal={async (value, action) => {
                                    await this.handleToModal(value, action, element.GSB_ID)
                                  }}
                                />
                              </KanbanContent>
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}

              </DivContentKanban>
              <ContainerPagination>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.arrayPartiallyApproved !== undefined && payment.quantityPages !== 1 && (
                        <Pagination
                          activePage={payment.pageActual}
                          items={payment.quantityPages}
                          leftBtn={<Icon>chevron_left</Icon>}
                          maxButtons={5}
                          rightBtn={<Icon>chevron_right</Icon>}
                          onSelect={position => {
                            this.paginationSelected(position, index);
                          }}
                        />
                      )}

                    </React.Fragment>
                  ))}
              </ContainerPagination>
            </Kanban>
            <Kanban color={"#d50000"}>
              <div className="titleContainer">
                <span>:: Negados</span>
              </div>
              <DivContentKanban color={"rgba(213,0,0,0.3)"}>
                {allPayments !== undefined &&
                  allPayments.map((payment, index) => (
                    <React.Fragment key={index}>
                      {payment.arrayDenied !== undefined &&
                        payment.arrayDenied.map((element, index) => (
                          <React.Fragment key={index}>
                            {element.page === payment.pagesActual && (
                              <KanbanContent key={element.GSB_ID}>
                                <CardItem key={element.GSB_ID}
                                  nameBank={element.GSB_BANCO}
                                  typeDocument={element.GSB_FORMA_PAGAMENTO}
                                  paymentForm={element.GSB_FORMA_PAGAMENTO}
                                  userName={element.USR_NOME}
                                  nrCheque={element.GSB_NR_DOCUMENTO}
                                  nrDocument={element.GSB_NR_DOCUMENTO}
                                  dateCredit={element.GSB_DTA_CREDITO}
                                  valueTotal={element.GSB_VALOR_TOTAL}
                                  status={element.GSB_FLG_APROVADO}
                                  setOpenModal={async (value, action) => {
                                    await this.handleToModal(value, action, element.GSB_ID)
                                  }}
                                />
                              </KanbanContent>
                            )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
              </DivContentKanban>
              {allPayments.length !== 0 &&
                allPayments.map((element, index) => (
                  <React.Fragment key={index}>
                    {element.arrayAuxDenied !== undefined && element.quantityPages !== 1 && (
                      <Pagination
                        activePage={element.pagesActual}
                        items={element.quantityPages}
                        leftBtn={<Icon>chevron_left</Icon>}
                        maxButtons={5}
                        rightBtn={<Icon>chevron_right</Icon>}
                        onSelect={position => {
                          this.paginationSelected(position, index);
                        }}
                      />
                    )}

                  </React.Fragment>
                ))}
            </Kanban>
          </ContainerInfos>


        </Container>
      </>
    )
  }
}

class ApprovalOfPayments extends Component {
  render() {
    return (
      <ApprovalOfPaymentsProvider>
        <ApprovalOfPaymentsComponent {...this.props} />
      </ApprovalOfPaymentsProvider>
    );
  }
}

export default ApprovalOfPayments