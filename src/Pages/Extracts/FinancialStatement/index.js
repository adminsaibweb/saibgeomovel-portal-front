import React, { forwardRef, Component } from 'react';
import Header from '../../../Components/System/Header';
import {
  DataFilter,
  Container,
  SubContainer,
  LineTopFilter,
  SubContainerTitle,
  Linha,
  DivDetalhe,
} from './style';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ptBR from 'date-fns/locale/pt-BR';
import moment from 'moment';
import api from '../../../services/api';
import { getFromStorage } from '../../../services/auth';
import { alerta } from '../../../services/funcoes';
import Skeleton from 'react-loading-skeleton';
import FinancialStatementData from '../../../Components/Extracts/FinancialStatementData';
import SaibRadioGroup from '../../../Components/Globals/SaibRadioGroup';

import {
  Icon,
  Chip,
  Collapsible,
  CollapsibleItem,
  Button,
} from 'react-materialize';
import M from 'materialize-css';

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={onClick}>
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

export default class FinancialStatement extends Component {
  state = {
    dataFilterGroupPrior: -1,
    dataFilterGroup: 3,
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    reportData: undefined,
    loading: true,
    vendedoresSelecionados: [],
    selectedFilter: '',
    changedFilter: 0,
    statusTitulos: 1,
  };

  componentDidMount = async () => {
    this.initCustomDates();
    await this.carregarVariaveisEstado();
    await this.loadFiltersList();
    await this.loadEstruturaAutorizada();
    let { customSelectedEnd } = this.state;
    this.handleLoadCustomDataEnd(customSelectedEnd, true);
  };

  loadEstruturaAutorizada = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/dashboard/estruturaautorizada/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      const retorno = await api.get(url);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let estruturaAutorizada = retorno.data.data;
          this.setState({
            estruturaAutorizada,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar a estrututa autorizada => ` + err);
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

  initCustomDates = () => {
    const endOfWeek = moment();
    const startOfWeek = moment().subtract(14, 'days');
    let customSelectedInitial = startOfWeek.toDate();
    let customSelectedEnd = endOfWeek.toDate();
    this.setState({ customSelectedInitial, customSelectedEnd });
  };

  handleClickFilterGroupDay = () => {
    let { dataFilterGroupPrior, dataFilterGroup, daySelected } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({
      dataFilterGroupPrior,
      dataFilterGroup: 1,
      selectedFilter: 'day',
    });
    this.handleLoadDayData(daySelected);
    this.onChangeFilter();
  };

  handleClickFilterGroupCustom = () => {
    let {
      dataFilterGroupPrior,
      dataFilterGroup,
      customSelectedInitial,
    } = this.state;
    dataFilterGroupPrior = dataFilterGroup;
    this.setState({
      dataFilterGroupPrior,
      dataFilterGroup: 3,
      selectedFilter: 'custom',
    });
    this.handleLoadCustomDataInitial(customSelectedInitial);
    this.onChangeFilter();
  };

  getEstruturaAutorizada = () => {
    let inElements = '';
    let { estruturaAutorizada } = this.state;

    if (estruturaAutorizada !== undefined) {
      for (const element of estruturaAutorizada) {
        inElements += "'" + element['ESTR_ID'] + "',";
      }

      if (inElements !== '') {
        return inElements.substr(0, inElements.length - 1);
      }
    }

    if (inElements === '') {
      inElements = '-9999999';
    }
    return inElements;
  };

  loadDataOf = async (startDate, finalDate, tipo, statusTitulos) => {
    try {
      // return;
      const { empresaAtiva, usuarioAtivo } = this.state;
      let vendedores;
      vendedores = this.getSelectedVendedores();

      const url =
        '/v1/extracts/financialstatement/' + empresaAtiva + '/' + usuarioAtivo;
      let datas = {
        startDate,
        finalDate,
        vendedores,
        estruturaAutorizada: this.getEstruturaAutorizada(),
        tipo,
        statusTitulos,
      };

      //console.log(datas);
      // return;
      const retorno = await api.post(url, datas);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          //console.log('result');
          //console.log(result);
          return result;
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar os indicadores => ` + err);
    }
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      reportData: undefined,
    });
    this.onChangeFilter();
    let { customSelectedInitial, statusTitulos } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom',
      statusTitulos
    );
    this.setState({ loading: false });
    this.setState({
      customSelectedEnd,
      reportData,
    });
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    this.setState({
      loading: true,
      selectedFilter: 'custom',
      reportData: undefined,
    });
    this.onChangeFilter();
    let { customSelectedEnd, statusTitulos } = this.state;
    let reportData = await this.loadDataOf(
      moment(customSelectedInitial).format('DD/MM/yyyy'),
      moment(customSelectedEnd).format('DD/MM/yyyy'),
      'custom',
      statusTitulos
    );
    setTimeout(() => {
      this.onChangeFilter();
    }, 50);
    this.setState({ loading: false });
    this.setState({
      customSelectedInitial,
      reportData,
    });
  };

  loadFiltersList = async () => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      const url =
        '/v1/extracts/financialstatement/allfilter/' +
        empresaAtiva +
        '/' +
        usuarioAtivo;
      const retorno = await api.get(url);
      // //console.log(retorno);

      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let result = retorno.data.data;
          //console.log('result');
          //console.log(result);

          let vendedores = result.vendedores;
          let vendedoresChips = {};

          //console.log('vendedores');
          //console.log(vendedores);

          for (const vendedor of vendedores) {
            vendedoresChips[vendedor.VENDEDOR] = null;
          }
          this.setState({
            vendedores,
            vendedoresChips,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({ loading: false });
      alerta(`Erro ao carregar os filtros => ` + err);
    }
  };

  handleAllDataUpdate = () => {
    const { selectedFilter, customSelectedInitial } = this.state;
    if (selectedFilter === 'custom') {
      this.handleLoadCustomDataInitial(customSelectedInitial);
    }
    this.onChangeFilter();
  };

  handleManipulaVendedores = () => {
    let dados = M.Chips.getInstance(document.getElementById('vendedoresChip'));
    let vendedoresSelecionados;
    if (dados !== undefined) {
      vendedoresSelecionados = dados.chipsData;
    } else {
      vendedoresSelecionados = [];
    }

    this.setState({ vendedoresSelecionados });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 5);
  };

  makeIn = (chipsElement, elements, searchText, searchKey) => {
    let inElements = '';
    if (chipsElement === undefined || elements === undefined) {
      return inElements;
    }
    for (const element of chipsElement) {
      const _element = elements.find(
        (elemento) => elemento[searchText] === element.tag
      );
      if (_element !== undefined) {
        inElements += "'" + _element[searchKey] + "',";
      }
    }
    if (inElements !== '') {
      return inElements.substr(0, inElements.length - 1);
    }
    return inElements;
  };

  getSelectedVendedores = () => {
    let { vendedoresSelecionados, vendedores } = this.state;
    return this.makeIn(
      vendedoresSelecionados,
      vendedores,
      'VENDEDOR',
      'VENDEDOR_ID'
    );
  };

  getAllVendedores = () => {
    const { vendedores } = this.state;
    let vendedoresFiltro = '';
    for (const vendedor of vendedores) {
      vendedoresFiltro += "'" + vendedor.VENDEDOR_ID + "',";
    }
    return vendedoresFiltro.substr(0, vendedoresFiltro.length - 1);
  };

  onChangeFiltroSituacaoEntrega = (status) => {
    //console.log(status);
    this.setState({ statusTitulos: status });
    setTimeout(() => {
      this.handleAllDataUpdate();
    }, 10);
  };

  onChangeFilter = () => {
    let { changedFilter } = this.state;
    changedFilter += 1;
    this.setState({ changedFilter });
  };

  render() {
    const {
      dataFilterGroup,
      customSelectedEnd,
      customSelectedInitial,
      dataFilterGroupPrior,
      loading,
      vendedoresSelecionados,
      vendedoresChips,
      selectedFilter,
      changedFilter,
      vendedores,
      estruturaAutorizada,
      reportData,
    } = this.state;
    return (
      <>
        <Header />
        <Container>
          <SubContainer className="kpiContainer">
            <SubContainerTitle>
              Rel. de Pendências Financeiras
            </SubContainerTitle>
            <LineTopFilter
              selected={dataFilterGroup}
              priorSelected={dataFilterGroupPrior}
              style={{
                justifyContent: 'start',
              }}
            >
              {dataFilterGroup === 3 && (
                <DataFilter loading={loading ? 1 : 0}>
                  <DatePicker
                    selected={customSelectedInitial}
                    onChange={(date) => this.handleLoadCustomDataInitial(date)}
                    locale={ptBR}
                    placeholderText="Data inicial"
                    dateFormat="dd/MM/yyyy"
                    selectsStart
                    startDate={customSelectedInitial}
                    endDate={customSelectedEnd}
                    customInput={<CustomCalendarInput />}
                  />
                  <DatePicker
                    selected={customSelectedEnd}
                    onChange={(date) => this.handleLoadCustomDataEnd(date)}
                    selectsEnd
                    startDate={customSelectedEnd}
                    endDate={customSelectedEnd}
                    minDate={customSelectedInitial}
                    locale={ptBR}
                    placeholderText="Data final"
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomCalendarInput />}
                  />
                  <Icon tiny>autorenew</Icon>
                </DataFilter>
              )}
              <DivDetalhe style={{ paddingLeft: '20px' }}
              >
                <SaibRadioGroup
                  valueItems={'"0","1","2"'}
                  classNameItems={'"itemTodos","itemVencidos","itemAVencer"'}
                  textItems={'"Todos","Vencidos","A vencer"'}
                  idItems={'"itemTodos","itemVencidos","itemAVencer"'}
                  classNameRadio="FiltroSituacaoPedido"
                  flexDirectionRadio="row"
                  disabledRadio="false"
                  captionRadio=""
                  defaultCheckedId={'itemVencidos'}
                  onChange={this.onChangeFiltroSituacaoEntrega}
                />
              </DivDetalhe>
            </LineTopFilter>
            <Linha className="filter">
              <Collapsible
                accordion={false}
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <CollapsibleItem
                  expanded={false}
                  header="Clique para filtrar"
                  icon={<Icon>filter_list</Icon>}
                  node="div"
                >
                  <Linha style={{ alignItems: 'row', display: 'flex' }}>
                    <DivDetalhe style={{ flex: 3 }}>
                      <label>Vendedores</label>
                      <Chip
                        id="vendedoresChip"
                        className="vendedoresChip"
                        close={false}
                        closeIcon={<Icon className="close">close</Icon>}
                        options={{
                          data:
                            vendedoresSelecionados !== undefined &&
                            vendedoresSelecionados,
                          onChipAdd: this.handleManipulaVendedores,
                          onChipDelete: this.handleManipulaVendedores,
                          autocompleteOptions: {
                            data: vendedoresChips,
                            limit: 5,
                            minLength: 1,
                            onAutocomplete: function noRefCheck() {},
                          },
                        }}
                      />
                    </DivDetalhe>
                  </Linha>
                  <Linha>
                    <Button
                      className="waves-effect waves-light saib-button is-primary"
                      onClick={() => {
                        this.setState({
                          vendedoresSelecionados: [],
                        });
                        setTimeout(() => {
                          this.handleAllDataUpdate();
                        }, 50);
                      }}
                    >
                      Limpar
                    </Button>
                  </Linha>
                </CollapsibleItem>
              </Collapsible>
            </Linha>
            {reportData !== undefined ? (
              <FinancialStatementData
                selectedFilter={selectedFilter}
                customSelectedInitial={customSelectedInitial}
                vendedoresSelecionados={vendedoresSelecionados}
                vendedores={vendedores}
                changedFilter={changedFilter}
                estruturaAutorizada={estruturaAutorizada}
                data={reportData}
                loading={loading ? 1 : 0}
              />
            ) : (
              <>
                <Linha style={{ alignItems: 'inherit' }}>
                  <DivDetalhe style={{ width: '100%' }} loading={1}>
                    <Skeleton count={10} />
                  </DivDetalhe>
                </Linha>
              </>
            )}
          </SubContainer>
        </Container>
      </>
    );
  }
}
