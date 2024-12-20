import React, { Component, forwardRef } from 'react';
import Header from '../../../Components/System/Header';
import {
  Container,
  Kanban,
  ContainerPagination,
  DivBaseKanbanTituloPai,
  DivKanbanContainer,
  KanbanContainer,
  LinhaKanban,
  Linha,
  DivDetalhe,
  ButtonFiltered,
  DataFilter,
  InputCod
} from './styles';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import SaibRadioGroup from "../../../Components/Globals/SaibRadioGroup"
import WaitScreen from "../../../Components/Globals/WaitScreen"
import SelectQuery from "../../../Components/Globals/SelectQuery"
import ItemDocument from "./ItemDocument"
import ApprovalOfPurchaseOrderProvider, { ApprovalOfPurchaseOrderContext } from "../../../providers/approvalOfPurchaseOrder"
import { getFromStorage } from "../../../services/auth"
import { alerta, formatOracleDateToBr } from '../../../services/funcoes';
import InputMask from 'react-input-mask';
import { Icon, Collapsible, CollapsibleItem, Pagination } from 'react-materialize';
import DatePicker from 'react-datepicker';
import { startOfMonth } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../../services/api';
import ModalItemsDetails from './ModalItemsDetails';

const CustomCalendarInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '130px',
      justifyContent: 'space-around',
      borderBottom: '1px solid #ccc',
    }}
  >
    <InputMask
      style={{ width: '100px' }}
      mask="99/99/9999"
      value={value}
      maskChar={null}
      onChange={onChange}
    />
    <span onClick={onClick} style={{ cursor: 'pointer', color: 'rgb(97, 9, 138)' }}>
      <Icon>date_range</Icon>
    </span>
  </div>
));

class ApprovalOfPurchaseOrderComponent extends Component {
  static contextType = ApprovalOfPurchaseOrderContext
  state = {
    startDate: new Date(),
    endDate: new Date(),
    providerSelected: undefined,
    typeOrderSelected: undefined,
    statusSelected: 2,
    codOrderSelected: "",

    loading: false,
    openModal: false,
    updateOrder: false,

    allData: false,
    orderWait: undefined,
    orderApproved: undefined,
    orderDenied: undefined,
    allOrders: [],
    allDataForFilter: undefined,
    documentApproved: undefined,

    allProviders: undefined,
    filterTypeOrders: undefined,

    sizePage: 3
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.loadAllData();
    await this.handleLoadProviders()
    const startDate = startOfMonth(new Date());
    this.setState({ startDate });
  };

  componentDidUpdate = async () => {
    const { updateOrder } = this.context
    if (this.state.updateOrder !== updateOrder) {
      this.setState({
        updateOrder
      })
      await this.carregarVariaveisEstado();
      await this.loadAllData()
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


  loadAllData = async () => {
    try {
      let { empresaAtiva, usuarioAtivo, allData, filterTypeOrders } = this.state;

      const res = await api.get(`v1/approvalofpurchaseorder/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data_movimentacao_inicial: "",
          data_movimentacao_final: "",
          fornecedor: ""
        }
      });
      if (res.data.sucess) {
        allData = res.data.data
        let filtered = []
        let count = 0

        res.data.data.forEach(element => {
          if (!filtered.find(item => item.typeOrder === element.GOC_TIPO)) {
            let item = {}
            item.typeOrder = element.GOC_TIPO
            item.labelOfApresentation = `${count} - ${element.GOC_TIPO}`
            filtered.push(item)
            count++
          }
        });
        filterTypeOrders = filtered
      }

      this.setState({
        allData,
        filterTypeOrders
      }, () => this.handleTypeFilters(allData))
    } catch (err) {
      alerta('Erro ao carregar os dados', 2);
    }
  };

  handleLoadProviders = async () => {
    try {
      let { empresaAtiva, usuarioAtivo, allProviders } = this.state;

      const res = await api.get(`v1/approvalofpurchaseorder/filters/${empresaAtiva}/${usuarioAtivo}`);

      allProviders = res.data.data.FORNECEDORES.map((item, index) => {
        let nameProvider = {}
        nameProvider.nameProvider = item
        nameProvider.labelOfApresentation = `${index} - ${item}`
        return nameProvider
      })

      this.setState({
        allProviders
      })
    } catch (err) {
      alerta('Erro ao buscar os fornecedores', 2);
    }
  }

  handleTypeFilters = (data) => {
    let { orderWait, orderApproved, orderDenied } = this.state

    let arrayWait = []
    let arrayApproved = []
    let arrayDenied = []

    data.map(item => {
      if (item.GOC_FLG_APROVADO === -1) {
        arrayWait.push(item)
      } else if (item.GOC_FLG_APROVADO === 1) {
        arrayApproved.push(item)
      } else if (item.GOC_FLG_APROVADO === 0) {
        arrayDenied.push(item)
      }

      return null
    })

    orderWait = arrayWait
    orderApproved = arrayApproved
    orderDenied = arrayDenied


    this.setState({
      orderWait,
      orderApproved,
      orderDenied
    }, () => this.handleCreatePagination())

  }

  handleCreatePagination = () => {
    const { orderApproved, orderDenied, orderWait, sizePage, allOrders } = this.state

    let arrayWaitApproved
    let arrayApproved
    let arrayDenied

    arrayWaitApproved = orderWait.map(item => {
      let orderWaitApproved = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of orderWait) {
        if (count <= sizePage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        orderWaitApproved.push(element);
        count++;
      }

      let quantityPages =
        Number(orderWaitApproved.length) !== 0 ? this.calculatePagination(Number(orderWaitApproved.length), sizePage) : 1;

      return { orderWaitApproved, quantityPages, pagesActual };
    });

    arrayApproved = orderApproved.map(item => {
      let allOrderApproved = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of orderApproved) {
        if (count <= sizePage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        allOrderApproved.push(element);
        count++;
      }

      let quantityPages =
        Number(allOrderApproved.length) !== 0 ? this.calculatePagination(Number(allOrderApproved.length), sizePage) : 1;

      return { allOrderApproved, quantityPages, pagesActual };
    });

    arrayDenied = orderDenied.map(item => {
      let allOrderDenied = [];

      let pagesActual = 1;
      let page = 1;
      let count = 1;

      for (const element of orderDenied) {
        if (count <= sizePage) {
          element.page = page;
        } else {
          page++;
          element.page = page;
          count = 1;
        }
        allOrderDenied.push(element);
        count++;
      }

      let quantityPages =
        Number(allOrderDenied.length) !== 0 ? this.calculatePagination(Number(allOrderDenied.length), sizePage) : 1;

      return { allOrderDenied, quantityPages, pagesActual };
    });

    allOrders[0] = arrayWaitApproved[0] ? arrayWaitApproved[0] : { orderWaitApproved: undefined }
    allOrders[1] = arrayApproved[0] ? arrayApproved[0] : { allOrderApproved: undefined }
    allOrders[2] = arrayDenied[0] ? arrayDenied[0] : { allOrderDenied: undefined }

    this.setState({
      allOrders
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
    const { allOrders } = this.state
    allOrders[index].pagesActual = Number(position);

    this.setState({ allOrders });
  };

  handleLoadCustomDataInitial = value => {
    let { startDate } = this.state
    startDate = value
    this.setState({
      startDate
    })
  };

  handleLoadCustomDataEnd = value => {
    let { endDate } = this.state
    endDate = value

    this.setState({
      endDate
    })
  };

  handleFilterProvider = event => {
    let { providerSelected } = this.state
    const value = event ? event.nameProvider : undefined
    providerSelected = value

    this.setState({
      providerSelected
    })
  }

  handleFilterTypeOrder = event => {
    let { typeOrderSelected } = this.state
    const value = event ? event.typeOrder : undefined
    typeOrderSelected = value

    this.setState({
      typeOrderSelected
    })
  }

  filterChangeStatus = value => {
    let { statusSelected } = this.state
    statusSelected = value

    this.setState({
      statusSelected
    })
  }

  handleFilterCodOrder = event => {
    let { codOrderSelected } = this.state
    const { value } = event.target ? event.target : ""
    codOrderSelected = value

    this.setState({ codOrderSelected })
  }


  runFilters = async () => {
    let { empresaAtiva, usuarioAtivo, startDate, endDate, providerSelected, typeOrderSelected, statusSelected, codOrderSelected } = this.state

    try {
      this.setState({
        loading: true
      })

      let dataInitial = formatOracleDateToBr(new Date(formatOracleDateToBr(startDate).split(" ", 1).toString().split(' ', 1).toString().split('/').reverse().join('/')))
      let dataEnd = formatOracleDateToBr(new Date(formatOracleDateToBr(endDate).split(" ", 1).toString().split(' ', 1).toString().split('/').reverse().join('/')))

      const res = await api.get(`v1/approvalofpurchaseorder/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data_movimentacao_inicial: dataInitial,
          data_movimentacao_final: dataEnd,
          fornecedor: providerSelected ? providerSelected : "",
          tipo_ordem_compra: typeOrderSelected ? typeOrderSelected : "",
          codigo_ordem: codOrderSelected ? codOrderSelected : "",
          status_aprovacao: statusSelected === 2 ? "" : statusSelected
        }
      })

      this.handleTypeFilters(res.data.data)
      if (res.data.data.length === 0) {
        alerta("Nenhum dado com o filtro selecionado", 2)
      }
      this.setState({
        loading: false
      })
    } catch (error) {
      alerta("Erro ao filtrar dados", 2)
      this.setState({
        loading: false
      })
    }
  }

  handleToModal = async (value, action, idDocument) => {
    let { allData, documentApproved } = this.state
    documentApproved = allData.find(item => item.GOC_ID === idDocument)

    if (action === 0) {
      this.setState({ loading: true })
      try {
        const { empresaAtiva, usuarioAtivo } = this.state
        const { setUpdateOrder } = this.context

        const updateOrder = {
          GOC_ID: idDocument,
          GOA_FLG_APROVADO: -1,
          GOA_OBSERVACAO: "Pedido voltando para fase de aprovação"
        }

        const res = await api.put(`v1/approvalofpurchaseorder/setstatus/${empresaAtiva}/${usuarioAtivo}`, updateOrder, {
          params: {
            data_credito_incial: "",
            data_credito_final: "",
            forma_pagamento: "",
          }
        })

        if (res.data.sucess) {
          await setUpdateOrder()
          alerta("Pedido alterado com sucesso", 1)
        }

      } catch (error) {
        alerta("Erro em alterar status do pedido", 2)
      }
      this.setState({ loading: false })
    } else {
      this.setState({
        documentApproved,
        openModal: value
      })
    }
  }

  render() {
    const { loading, startDate, endDate, allOrders, allProviders, filterTypeOrders, documentApproved } = this.state;

    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            titulo={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>card_giftcard</Icon>Aprovação de Ordem de Compra
              </span>
            }
          />

          {this.state.openModal && <ModalItemsDetails order={documentApproved} openModal={this.state.openModal} setOpenModal={value => {
            this.setState({ openModal: Boolean(value) })
          }} />}
          <Collapsible>
            <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
              <Linha>
                <DivDetalhe>
                  <span style={{ paddingLeft: "5px", fontWeight: '700' }}>Data da Ordem</span>
                  <DataFilter loading={loading ? 1 : 0} style={{ flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ paddingLeft: '5px' }}>Data incial</label>
                      <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={this.handleLoadCustomDataInitial}
                        locale={ptBR}
                        placeholderText="Data inicial"
                        dateFormat="dd/MM/yyyy"
                        selectsStart
                        startDate={startDate}
                        customInput={<CustomCalendarInput />}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ paddingLeft: '5px' }}>Data final</label>
                      <DatePicker
                        selected={endDate}
                        onChange={this.handleLoadCustomDataEnd}
                        startDate={startDate}
                        minDate={startDate}
                        locale={ptBR}
                        placeholderText="Data final"
                        dateFormat="dd/MM/yyyy"
                        customInput={<CustomCalendarInput />}
                      />
                    </div>
                  </DataFilter>
                </DivDetalhe>

                <DivDetalhe style={{ paddingLeft: '5px', width: "195px" }}>
                  <span style={{ fontWeight: '700', margin: "0.7rem 0" }}>Fornecedor</span>
                  <SelectQuery
                    inputName="selectProvider"
                    loading={false}
                    colorPrimary
                    itemSelected={this.state.providerSelected}
                    query={allProviders}
                    keys={['nameProvider']}
                    label="labelOfApresentation"
                    onSelect={(item) => {
                      this.handleFilterProvider(item);
                    }}
                    onDelete={() => {
                      this.handleFilterProvider(null);
                    }}
                  />
                </DivDetalhe>

                <DivDetalhe style={{ paddingLeft: '5px', width: "190px" }}>
                  <span style={{ fontWeight: '700', margin: "0.7rem 0" }}>Tipo ordem de compra</span>
                  <SelectQuery
                    inputName="selectTypeOrder"
                    loading={false}
                    colorPrimary
                    itemSelected={this.state.typeOrderSelected}
                    query={filterTypeOrders}
                    keys={['typeOrder']}
                    label="labelOfApresentation"
                    onSelect={(item) => {
                      this.handleFilterTypeOrder(item);
                    }}
                    onDelete={() => {
                      this.handleFilterTypeOrder(null);
                    }}
                  />
                </DivDetalhe>

                <DivDetalhe style={{ paddingLeft: '5px', flexWrap: "wrap", width: "150px" }}>
                  <span style={{ fontWeight: '700', margin: "0.5rem 0" }}>Código ordem</span>
                  <InputCod value={this.state.codOrderSelected} onChange={(value) => this.handleFilterCodOrder(value)} />
                </DivDetalhe>

                <DivDetalhe style={{ paddingLeft: '5px', flexWrap: "wrap" }}>
                  <span style={{ fontWeight: '700' }}>Status</span>
                  <SaibRadioGroup
                    valueItems={'"-1", "1", "0", "2"'}
                    classNameItems={
                      '"wait", "approved", "denied", "allItem"'
                    }
                    textItems={
                      '"Aguardando","Aprovados", "Negados", "Todos"'
                    }
                    idItems={
                      '"itemWait","itemApproved", "itemDenied", "itemAllItems"'
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
                </DivDetalhe>


                <ButtonFiltered>
                  <button onClick={this.runFilters}>
                    <Icon tiny>filter_alt</Icon>Filtrar
                  </button>
                </ButtonFiltered>
              </Linha>
            </CollapsibleItem>
          </Collapsible>

          <LinhaKanban>
            <Kanban cor={'#8870A4'}>
              <DivBaseKanbanTituloPai cor={'#8870A4'}>:: Aguardando aprovação</DivBaseKanbanTituloPai>
              <DivKanbanContainer>
                {allOrders !== undefined && allOrders.map((element, index) => (
                  <React.Fragment key={index}>
                    {element.orderWaitApproved !== undefined && element.orderWaitApproved.map((order, index) => (
                      <React.Fragment key={index}>
                        {order.page === element.pagesActual && (
                          <KanbanContainer key={order.GOC_ID}>
                            <ItemDocument
                              type={order.GOC_TIPO}
                              provider={order.GOC_FORNECEDOR}
                              dataOrder={order.GOC_DTA_ORDEM}
                              dataPrediction={order.GOC_DTA_PREVISAO}
                              nameUser={order.USR_NOME}
                              numberDoc={order.GOC_NUMERO}
                              value={order.GOC_VALOR}
                              status={order.GOC_FLG_APROVADO}
                              observation={order.GOC_OBSERVACOES}
                              setOpenModal={async (value, action) => {
                                await this.handleToModal(value, action, order.GOC_ID)
                              }}
                            />
                          </KanbanContainer>
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </DivKanbanContainer>
              <ContainerPagination>
                {allOrders.length !== 0 &&
                  allOrders.map((element, index) => (
                    <React.Fragment key={index}>
                      {element.orderWaitApproved !== undefined && element.quantityPages !== 1 && (
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
              </ContainerPagination>
            </Kanban>

            <Kanban cor={'#08703E'}>
              <DivBaseKanbanTituloPai cor={'#08703E'}>:: Aprovados</DivBaseKanbanTituloPai>
              <DivKanbanContainer cor={'rgba(8,112,62,0.3)'}>
                {allOrders !== undefined && allOrders.map((element, index) => (
                  <React.Fragment key={index}>
                    {element.allOrderApproved !== undefined && element.allOrderApproved.map((order, index) => (
                      <React.Fragment key={index}>
                        {order.page === element.pagesActual && (
                          <KanbanContainer key={order.GOC_ID}>
                            <ItemDocument
                              type={order.GOC_TIPO}
                              provider={order.GOC_FORNECEDOR}
                              dataOrder={order.GOC_DTA_ORDEM}
                              dataPrediction={order.GOC_DTA_PREVISAO}
                              nameUser={order.USR_NOME}
                              numberDoc={order.GOC_NUMERO}
                              value={order.GOC_VALOR}
                              status={order.GOC_FLG_APROVADO}
                              observation={order.GOC_OBSERVACOES}
                              setOpenModal={async (value, action) => {
                                await this.handleToModal(value, action, order.GOC_ID)
                              }}
                            />
                          </KanbanContainer>
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </DivKanbanContainer>
              <ContainerPagination>
                {allOrders.length !== 0 &&
                  allOrders.map((element, index) => (
                    <React.Fragment key={index}>
                      {element.allOrderApproved !== undefined && element.quantityPages !== 1 && (
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
              </ContainerPagination>
            </Kanban>

            <Kanban cor={'#d50000'}>
              <DivBaseKanbanTituloPai cor={'#d50000'}>:: Negados</DivBaseKanbanTituloPai>
              <DivKanbanContainer cor={'rgba(213,0,0,0.3)'}>
                {allOrders !== undefined && allOrders.map((element, index) => (
                  <React.Fragment key={index}>
                    {element.allOrderDenied !== undefined && element.allOrderDenied.map((order, index) => (
                      <React.Fragment key={index}>
                        {order.page === element.pagesActual && (
                          <KanbanContainer key={order.GOC_ID}>
                            <ItemDocument
                              type={order.GOC_TIPO}
                              provider={order.GOC_FORNECEDOR}
                              dataOrder={order.GOC_DTA_ORDEM}
                              dataPrediction={order.GOC_DTA_PREVISAO}
                              nameUser={order.USR_NOME}
                              numberDoc={order.GOC_NUMERO}
                              value={order.GOC_VALOR}
                              status={order.GOC_FLG_APROVADO}
                              observation={order.GOC_OBSERVACOES}
                              setOpenModal={async (value, action) => {
                                await this.handleToModal(value, action, order.GOC_ID)
                              }}
                            />
                          </KanbanContainer>
                        )}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </DivKanbanContainer>
              <ContainerPagination>
                {allOrders.length !== 0 &&
                  allOrders.map((element, index) => (
                    <React.Fragment key={index}>
                      {element.allOrderDenied !== undefined && element.quantityPages !== 1 && (
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
              </ContainerPagination>
            </Kanban>
          </LinhaKanban>
        </Container>
      </>
    );
  }
}
class ApprovalOfPurchaseOrder extends Component {
  render() {
    return (
      <ApprovalOfPurchaseOrderProvider>
        <ApprovalOfPurchaseOrderComponent {...this.props} />
      </ApprovalOfPurchaseOrderProvider>
    );
  }
}

export default ApprovalOfPurchaseOrder