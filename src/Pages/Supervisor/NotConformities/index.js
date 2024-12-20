import React, { Component } from 'react';
import { Button, Chip, Collapsible, CollapsibleItem, Icon, Pagination, Modal, Checkbox } from 'react-materialize';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import PageIncoformities from '../../../Components/Supervisor/NotConformities/PageIncoformities';
import Header from '../../../Components/System/Header';
import api from '../../../services/api';
import M from 'materialize-css';
import Calendar from '../../../Components/Globals/Calendar';
import { Container, Linha, ContentBodyCollapsible, DivDetalhe, Labels, ContentModal, ContentBodyModal } from './styled';
import { alerta, dateFormat } from '../../../services/funcoes';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import { getFromStorage } from '../../../services/auth';

export default class NotConformities extends Component {
  state = {
    loading: false,
    openModal: false,
    clearSelecteds: false,
    allDataInconformities: [],
    dataInconformities: [],
    pageActive: 1,
    indexesPages: 1,
    routesToFilter: [],
    incoformitiesToFilter: [],
    clientsToFilter: [],
    dateSelected: new Date(),

    incoformitiesSelected: [],
    routesSelected: [],
    reasonNotToBuySelected: [],
    clientsSelected: [],
    reasonNotToBuy: [],

    updatePopUp: 0,
  };

  async componentDidMount() {
    await this.carregarVariaveisEstado();
    await this.listIncoformities();
    await this.loadOptionsFilter();
  }

  loadOptionsFilter = async () => {
    const { dateSelected } = this.state;
    this.setState({
      loading: true,
    });
    const dataToSend = {
      data: dateFormat(dateSelected, 'DD/MM/yyyy'),
    };
    try {
      const res = await api.post(
        `v1/ApprovalOfComercialRules/NotConformities/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { sucess, data } = res.data;
      if (sucess) {
        this.setState(
          {
            allDataInconformities: data,
            incoformitiesToFilter: data.map((data_) => {
              return data_.DESCR_NCFM;
            }),
          },
          () => {
            // this.handlePreparePagination();
            this.listAllRoutes();
            this.listAllIncoformitiesToFilter();
            this.listAllClients();
            this.listAllReasonNotToBuy();
          }
        );
      }
    } catch (error) {
      this.setState({
        loading: false,
      });
      //console.log(error);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  listIncoformities = async () => {
    const { dateSelected } = this.state;
    this.setState({
      loading: true,
    });
    const dataToSend = {
      data: dateFormat(dateSelected, 'DD/MM/yyyy'),
    };
    try {
      const res = await api.post(
        `v1/ApprovalOfComercialRules/NotConformities/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { sucess, data } = res.data;
      if (sucess) {
        // console.log('data', data);
        this.setState(
          {
            allDataInconformities: data,
            dataInconformities: data,
            incoformitiesToFilter: data.map((data_) => {
              return data_.DESCR_NCFM;
            }),
          },
          () => {
            this.handlePreparePagination();
            this.listAllRoutes();
            this.listAllIncoformitiesToFilter();
            this.listAllClients();
            this.listAllReasonNotToBuy();
          }
        );
      }
    } catch (error) {
      this.setState({
        loading: false,
      });
      //console.log(error);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    // //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  listAllIncoformitiesToFilter = () => {
    const { allDataInconformities } = this.state;

    let incoformitiesChips = {};

    for (let incoformity in allDataInconformities) {
      let item = allDataInconformities[incoformity].DESCR_NCFM;
      incoformitiesChips[item] = null;
    }

    this.setState({
      incoformitiesChips,
    });
  };

  listAllRoutes = () => {
    const { allDataInconformities } = this.state;

    const routes = allDataInconformities.map((data) => {
      return {
        descripiton: data.ESTR_DESCR_ROTA,
        id: data.ID_NCFM_ESTR,
      };
    });

    let routesChips = {};

    for (let route in routes) {
      let item = routes[route].descripiton;
      routesChips[item] = null;
    }

    this.setState({
      routesToFilter: routes,
      routesChips,
    });
  };

  listAllClients = () => {
    const { allDataInconformities } = this.state;

    const clients = allDataInconformities.map((data) => data.NOME_FANTASIA);
    let clientsChips = {};

    for (let client in clients) {
      let item = clients[client];
      clientsChips[item] = null;
    }

    this.setState({
      clientsChips,
    });
  };

  listAllIncoformitiesToFilter = () => {
    const { allDataInconformities } = this.state;

    const data = allDataInconformities.map((data) => data.DESCR_NCFM);

    this.setState({
      reasonNotToBuy: [...new Set(data)], //inserindo somente dados sem repetir
    });
  };

  listAllReasonNotToBuy = () => {
    const { allDataInconformities } = this.state;

    const data = allDataInconformities.map((data) => data.DESCRICAO);
    let reasonNotToBuyChips = {};

    for (let data_ in data) {
      let item = data[data_];
      reasonNotToBuyChips[item] = null;
    }

    this.setState({
      reasonNotToBuyChips,
    });
  };

  handlePreparePagination = () => {
    this.setState({
      pageActive: 0,
    });
    const { dataInconformities } = this.state;
    const countMaxItensPerPage = 40;
    let indexesPages = dataInconformities.length >= 40 ? dataInconformities.length / countMaxItensPerPage : 1;

    if (indexesPages % 2 !== 0 && indexesPages !== 1) {
      indexesPages = parseInt((indexesPages += 1));
    }

    if (dataInconformities.length >= 40) {
      for (let i = 1; i <= indexesPages; i++) {
        if (i === indexesPages) {
          for (let j = countMaxItensPerPage * (indexesPages - 1); j < dataInconformities.length; j++) {
            dataInconformities[j].index = i;
          }
        } else {
          for (let j = countMaxItensPerPage * (i - 1); j < countMaxItensPerPage * i; j++) {
            dataInconformities[j].index = i;
          }
        }
      }

      this.setState({
        pageActive: 1,
        dataInconformities,
        indexesPages,
      });
    } else {
      for (let data of dataInconformities) {
        data.index = 1;
      }
      this.setState({
        pageActive: 1,
        dataInconformities,
        indexesPages,
      });
    }
  };

  onChangeRoutes = () => {
    const { allDataInconformities } = this.state;

    if (document.getElementById('routesChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('routesChips'));
      let routesSelected;
      if (dados !== undefined) {
        routesSelected = dados.chipsData;
        let newsIncoformities = [];

        if (routesSelected.length > 0) {
          for (let route of routesSelected) {
            const data = allDataInconformities.find((data_) => data_.ESTR_DESCR_ROTA === route.tag);
            newsIncoformities.push(data);
          }
          this.setState({
            routesSelected,
          });
        } else {
          this.setState({
            routesSelected,
          });
        }
      }
    }
  };

  onChangeClients = () => {
    const { allDataInconformities } = this.state;

    if (document.getElementById('clientsChips') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('clientsChips'));
      let clientsSelected;
      if (dados !== undefined) {
        clientsSelected = dados.chipsData;
        let newsIncoformities = [];

        if (clientsSelected.length > 0) {
          for (let client of clientsSelected) {
            const data = allDataInconformities.find((data_) => data_.NOME_FANTASIA === client.tag);
            newsIncoformities.push(data);
          }
          this.setState(
            {
              clientsSelected,
            },
            () => {}
          );
        } else {
          this.setState({
            clientsSelected,
          });
        }
      } else {
        clientsSelected = [];
      }
    }
  };

  onChangeInconformities = (ev) => {
    const { incoformitiesSelected } = this.state;

    const { checked, value } = ev.target;

    if (checked) {
      this.setState((prevState) => ({
        incoformitiesSelected: [...prevState.incoformitiesSelected, value],
      }));
    } else {
      this.setState({
        incoformitiesSelected: incoformitiesSelected.filter((incoformity) => incoformity !== value),
      });
    }

    // if (document.getElementById('incoformities') !== undefined) {
    //   let dados = M.Chips.getInstance(document.getElementById('incoformities'));
    //   let incoformities;
    //   if (dados !== undefined) {
    //     incoformities = dados.chipsData;
    //     let newsIncoformities = [];

    //     if (incoformities.length > 0) {
    //       for (let incoformity of incoformities) {
    //         for (let incoformity_ of allDataInconformities) {
    //           if (incoformity_.DESCR_NCFM === incoformity.tag) newsIncoformities.push(incoformity_);
    //         }
    //       }
    //       this.setState({
    //         incoformitiesSelected: incoformities,
    //       });
    //     } else {
    //       this.setState({
    //         incoformitiesSelected: incoformities,
    //       });
    //     }
    //   } else {
    //     incoformities = [];
    //   }
    // }
  };

  onChangeReasonNotToBuy = () => {
    const { allDataInconformities } = this.state;

    if (document.getElementById('reasonNotToBuy') !== undefined) {
      let dados = M.Chips.getInstance(document.getElementById('reasonNotToBuy'));
      let reasonNotToBuy;
      if (dados !== undefined) {
        reasonNotToBuy = dados.chipsData;
        let newsreasonNotToBuy = [];
        if (reasonNotToBuy.length > 0) {
          for (let incoformity of reasonNotToBuy) {
            for (let incoformity_ of allDataInconformities) {
              if (incoformity_.DESCRICAO === incoformity.tag) newsreasonNotToBuy.push(incoformity_);
            }
          }
        }
        this.setState({
          reasonNotToBuySelected: reasonNotToBuy,
        });
      } else {
        reasonNotToBuy = [];
      }
    }
  };

  handleFilter = async () => {
    const {
      clientsSelected,
      routesSelected,
      incoformitiesSelected,
      allDataInconformities,
      reasonNotToBuySelected,
    } = this.state;

    // console.log(this.state);
    this.setState({
      loading: true,
    });

    let newData = [];
    let find1, find2, find3, find4;

    for (let incoformity_ of allDataInconformities) {
      find1 = false;
      find2 = false;
      find3 = false;
      find4 = false;

      if (incoformitiesSelected?.length > 0) {
        for (let incoformity of incoformitiesSelected) {
            if (incoformity_.DESCR_NCFM === incoformity) {
              find1 = true;
              break;
            }
        }
      } else {
        find1 = true;
      }

      if (routesSelected?.length > 0) {
        for (let route of routesSelected) {
          if (incoformity_.ESTR_DESCR_ROTA === route.tag){
            find2 = true;
            break;
          }
        }
      } else {
        find2 = true;
      }

      if (clientsSelected?.length > 0) {
        for (let client of clientsSelected) {
          if (incoformity_.NOME_FANTASIA === client.tag){
            find3 = true;
            break;
          }
        }
      } else {
        find3 = true;
      }

      if (reasonNotToBuySelected?.length > 0) {
        for (let reason of reasonNotToBuySelected) {
          if (incoformity_.DESCRICAO === reason.tag){
            find4 = true;
            break;
          }
        }
      } else {
        find4 = true;
      }

      if (find1 && find2 && find3 && find4){
        newData = newData.concat(incoformity_);
      }
    }

    if (
      !reasonNotToBuySelected?.length > 0 &&
      !incoformitiesSelected?.length > 0 &&
      !routesSelected?.length > 0 &&
      !clientsSelected?.length > 0
    ) {
      this.setState(
        {
          dataInconformities: allDataInconformities,
          loading: false,
        },
        () => this.handlePreparePagination()
      );
    } else {
      this.setState(
        {
          dataInconformities: newData,
          loading: false,
        },
        () => this.handlePreparePagination()
      );
    }
  };

  clearSelecteds = () => {
    this.setState(
      {
        clearSelecteds: true,
        incoformitiesSelected: [],
      },
      () => {
        this.setState({
          clearSelecteds: false,
        });
      }
    );
  };

  handleSaveIncoformities = async (idsIncoformities, aproval) => {
    this.setState({
      aproval,
      idsIncoformities,
      openModal: true,
    });
  };

  handleSave = async (idsIncoformities, aproval) => {
    try {
      const dataToSend = {
        lacunaFechada: aproval,
        id: idsIncoformities,
      };
      const res = await api.post(
        `v1/ApprovalOfComercialRules/NotConformities/setstatus/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        dataToSend
      );
      const { sucess } = res.data;
      if (sucess) {
        idsIncoformities.length > 1
          ? alerta('Não conformidades alteradas com sucesso', 1)
          : alerta('Não conformidade alterada com sucesso', 1);

        this.listIncoformities();
      } else {
        alerta('Erro ao salvar não conformidade');
      }
    } catch (error) {}
  };

  render() {
    const {
      loading,
      pageActive,
      dataInconformities,
      indexesPages,
      dateSelected,
      openModal,
      aproval,
      clearSelecteds,
      idsIncoformities,
    } = this.state;

    return (
      <div>
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
                  <Icon>notification_important</Icon>Não conformidades
                </span>
              )
            }
          />

          <Linha className="filter">
            <Collapsible
              accordion
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem expanded={false} header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                <ContentBodyCollapsible>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '1',
                    }}
                  >
                    <Linha className="lineTopFilter">
                      <div className="calendar">
                        <Calendar
                          date={dateSelected}
                          onChange={(date) => {
                            this.setState(
                              {
                                dateSelected: date,
                              },
                              async () => await this.loadOptionsFilter()
                            );
                          }}
                        />
                      </div>
                      <DivDetalhe flex="1">
                        <Labels>Rotas</Labels>
                        <Chip
                          id="routesChips"
                          className="routesChips"
                          close={false}
                          closeIcon={<Icon className="close">close</Icon>}
                          options={{
                            data: this.state.routesSelected ? this.state.routesSelected : [],
                            onChipAdd: this.onChangeRoutes,
                            onChipDelete: this.onChangeRoutes,
                            autocompleteOptions: {
                              data: this.state.routesChips,
                              limit: 1,
                              onAutocomplete: function noRefCheck() {},
                            },
                          }}
                        />
                      </DivDetalhe>

                      <DivDetalhe flex="1">
                        <Labels>Tipo não compra</Labels>
                        <Chip
                          id="reasonNotToBuy"
                          className="reasonNotToBuy"
                          close={false}
                          closeIcon={<Icon className="close">close</Icon>}
                          options={{
                            data: this.state.reasonNotToBuySelected ? this.state.reasonNotToBuySelected : [],
                            onChipAdd: this.onChangeReasonNotToBuy,
                            onChipDelete: this.onChangeReasonNotToBuy,
                            autocompleteOptions: {
                              data: this.state.reasonNotToBuyChips,
                              limit: 1,
                              onAutocomplete: function noRefCheck() {},
                            },
                          }}
                        />
                      </DivDetalhe>

                      <DivDetalhe flex="1">
                        <Labels>Clientes</Labels>
                        <Chip
                          id="clientsChips"
                          className="clientsChips"
                          close={false}
                          closeIcon={<Icon className="close">close</Icon>}
                          options={{
                            data: this.state.clientsSelected ? this.state.clientsSelected : [],
                            onChipAdd: this.onChangeClients,
                            onChipDelete: this.onChangeClients,
                            autocompleteOptions: {
                              data: this.state.clientsChips,
                              limit: 1,
                              onAutocomplete: function noRefCheck() {},
                            },
                          }}
                        />
                      </DivDetalhe>

                      <DivDetalhe>
                        <button
                          className="waves-effect waves-light saib-button is-primary "
                          onClick={async () => {
                            await this.listIncoformities();
                            this.handleFilter();
                          }}
                        >
                          <Icon>search</Icon>Filtrar
                        </button>
                      </DivDetalhe>
                    </Linha>

                    <Linha>
                      <div className="contentIncoformity">
                        <Labels className="labelIncoformity">Não conformidades</Labels>
                        {this.state.reasonNotToBuy.map((reason, i) => (
                          <DivDetalhe key={i}>
                            <Checkbox
                              className="checkAll"
                              id={'Checkbox' + i}
                              label={reason}
                              value={reason}
                              checked={this.state.incoformitiesSelected.includes(reason)}
                              onChange={this.onChangeInconformities}
                            />
                          </DivDetalhe>
                        ))}
                      </div>
                    </Linha>
                  </div>
                </ContentBodyCollapsible>
              </CollapsibleItem>
            </Collapsible>
          </Linha>

          <div className="content">
            {!loading && (
              <>
                <Pagination
                  activePage={pageActive}
                  items={indexesPages}
                  leftBtn={<Icon>chevron_left</Icon>}
                  maxButtons={8}
                  rightBtn={<Icon>chevron_right</Icon>}
                  onSelect={(numberPage) => {
                    this.setState({
                      pageActive: numberPage,
                    });
                  }}
                />
                {dataInconformities.length !== 0 ? (
                  <PageIncoformities
                    indexPage={pageActive}
                    clearSelecteds={clearSelecteds}
                    data={dataInconformities}
                    handleSaveIncoformities={this.handleSaveIncoformities}
                  />
                ) : (
                  <DivDetalhe>
                    <p>Sem dados para exibir</p>
                  </DivDetalhe>
                )}
                <Pagination
                  activePage={pageActive}
                  items={indexesPages}
                  leftBtn={<Icon>chevron_left</Icon>}
                  maxButtons={8}
                  rightBtn={<Icon>chevron_right</Icon>}
                  onSelect={(numberPage) => {
                    this.setState({
                      pageActive: numberPage,
                    });
                  }}
                />
              </>
            )}
          </div>

          {openModal && (
            <ContentModal className="container">
              <Modal
                className="modal-item-activity"
                actions={[
                  <Button
                    modal="close"
                    style={{ marginRight: '5px' }}
                    node="button"
                    waves="green"
                    className="waves-effect waves-light saib-button is-primary saib2"
                    onClick={() => {
                      this.handleSave(this.state.idsIncoformities, aproval);
                    }}
                  >
                    Sim
                  </Button>,
                  <Button
                    modal="close"
                    node="button"
                    href="#modal1"
                    waves="green"
                    className="waves-effect waves-light saib-button is-primary"
                    onClick={() =>
                      this.setState({
                        openModal: false,
                      })
                    }
                  >
                    Não
                  </Button>,
                ]}
                bottomSheet={false}
                fixedFooter={false}
                header="Alerta"
                id="modal1"
                open={openModal}
                options={{
                  dismissible: true,
                  endingTop: '10%',
                  inDuration: 250,
                  onCloseEnd: () => {
                    this.clearSelecteds();
                    this.setState({
                      openModal: false,
                    });
                  },
                  onCloseStart: null,
                  onOpenEnd: null,
                  onOpenStart: null,
                  opacity: 0.5,
                  outDuration: 250,
                  preventScrolling: true,
                  startingTop: '4%',
                }}
                root={document.body}
              >
                <ContentBodyModal>
                  <Linha>
                    <DivDetalhe flex={2}>
                      <h5>
                        Deseja <span>{aproval ? 'aprovar' : 'não aprovar'}</span>
                        {idsIncoformities.length > 1
                          ? ' todas não conformidades selecionadas ?'
                          : ' essa não conformidade ?'}
                      </h5>
                      <p className="paragraphAction">Essa ação é irreversível!</p>
                    </DivDetalhe>
                  </Linha>
                </ContentBodyModal>
                {/* <PopUpNotConformitie aproval={aproval} idsIncoformities={idsIncoformities} updatePopUp={updatePopUp} /> */}
              </Modal>
            </ContentModal>
          )}
        </Container>
      </div>
    );
  }
}
