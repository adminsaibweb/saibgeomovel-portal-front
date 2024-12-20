import React, { Component } from 'react';
import { Container, Linha, DivDetalhe, Labels } from './style';
import DirectTituloJanela from '../../../Components/Globals/DirectTituloJanela';
import WaitScreen from '../../../Components/Globals/WaitScreen';
import Header from '../../../Components/System/Header';
import {
  Button,
  Icon,
  Checkbox,
} from 'react-materialize';
import { getFromStorage } from '../../../services/auth';
import { haveData, alerta } from '../../../services/funcoes';
import api from '../../../services/api';
import 'react-datepicker/dist/react-datepicker.css';
import { withRouter } from 'react-router-dom';

class Flow extends Component {
  state = {
    loading: false,
    flow: undefined,
  };
  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    await this.loadSearchs();
  };

  carregarVariaveisEstado = async (e) => {
    let flow = this.props.location.state.flow;
    const { action } = this.props.location.state;
    if (flow === undefined) {
      flow = {};
      flow.GAF_FLG_TIPO_USUARIO = 0;
      flow.GAF_FLG_STATUS = 1;
    } else {
      let searchs = flow.PESQUISAS;
      let counter = 0;
      for (const dataItem of searchs) {
        dataItem.checked = false;
        dataItem.position = counter;
        dataItem.counter = counter;
        // dataItem.checked = false;
        counter += 1;
      }
      this.setState({ searchs });
    }
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      newFlow: action === 'novo',
      flow,
    });
  };

  loadSearchs = async () => {
    const { empresaAtiva, usuarioAtivo, flow } = this.state;
    try {
      this.setState({ loading: true });
      let url;
      url = '/v1/searchs/' + empresaAtiva + '/' + usuarioAtivo;
      const retorno = await api.get(url);
      if (retorno.data && retorno.data.sucess) {
        let searchs = retorno.data.data;
        let counter = 0;
        let findedItem = undefined;
        for (const dataItem of searchs) {
          findedItem =
            flow !== undefined && flow.PESQUISAS !== undefined
              ? flow.PESQUISAS.find(
                  (item) => item.GFP_GAP_ID === dataItem.GAP_ID
                )
              : undefined;
          dataItem.checked = findedItem !== undefined;
          dataItem.position =
            findedItem !== undefined
              ? parseInt(findedItem.GFP_POSICAO)
              : counter;
          dataItem.counter = counter;
          counter += 1;
        }

        if (flow !== undefined && flow.PESQUISAS !== undefined) {
          let _searchs = searchs.sort((a, b) => {
            return a.position < b.position ? -1 : 0;
          });
          let counter = 0;
          for (const dataItem of _searchs) {
            dataItem.position = counter;
            dataItem.counter = counter;
            counter += 1;
          }

          this.setState({ searchs: _searchs, loading: false });
        } else {
          this.setState({ searchs, loading: false });
        }
      }
      this.setState({ loading: false });
    } catch (err) {
      //console.log('111');
      alerta('Erro ao carregar as pesquisas =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  onChangeFlowActive = (e) => {
    let { flow } = this.state;
    flow.GAF_FLG_STATUS = e.target.checked ? 1 : 0;
    this.setState({ flow });
  };

  onchangeDescription = (e) => {
    let { flow } = this.state;
    flow.GAF_DESCRICAO = e.target.value;
    this.setState({ flow });
  };

  onChangeFlowType = (e) => {
    let { flow } = this.state;
    flow.GAF_FLG_TIPO_USUARIO = parseInt(e.target.value);
    this.setState({ flow });
  };

  onClickSelectAll = () => {
    let { selectAll, searchs } = this.state;

    selectAll = !selectAll;
    for (const search of searchs) {
      search.checked = selectAll;
    }

    this.setState({ searchs, selectAll });
  };

  onClickSelectSearch = (e, search) => {
    let { searchs } = this.state;
    let localSearch = searchs.find((item) => item.GAP_ID === search.GAP_ID);
    if (localSearch !== undefined) {
      localSearch.checked = e.target.checked;
    }
    this.setState({ searchs });
    // search.checked = e.target.checked;
  };

  onMakeUp = (search) => {
    if (search.position > 0) {
      let { searchs } = this.state;
      let priorPosition = search.position;
      let priorCounter = search.counter;
      let finded = searchs.find((item) => item.position === priorPosition - 1);
      let nextPosition = finded.position;
      let nextCounter = finded.counter;
      finded.position = priorPosition;
      finded.counter = priorCounter;
      search.position = nextPosition;
      search.counter = nextCounter;
      let _searchs = searchs.sort((a, b) => {
        return a.position > b.position ? 0 : -1;
      });
      this.setState({ searchs: _searchs });
    }
  };

  onMakeDown = (search) => {
    let { searchs } = this.state;
    if (search.position + 1 < searchs.length) {
      let priorPosition = search.position;
      let priorCounter = search.counter;
      let finded = searchs.find((item) => item.position === priorPosition + 1);
      let nextPosition = finded.position;
      let nextCounter = finded.counter;
      finded.position = priorPosition;
      finded.counter = priorCounter;
      search.position = nextPosition;
      search.counter = nextCounter;
      let _searchs = searchs.sort((a, b) => {
        return a.position > b.position ? 0 : -1;
      });
      this.setState({ searchs: _searchs });
    }
  };

  handleValidateSave = () => {
    const { searchs, flow } = this.state;
    let result = '';

    if (!haveData(flow.GAF_DESCRICAO)) {
      result += 'Digite uma descrição para este fluxo de pesquisa.\n';
    }
    // //console.log(searchs);
    if (searchs.filter((item) => item.checked).length === 0) {
      result += 'Selecione uma ou mais pesquisas antes de salvar.\n';
    }
    return result;
  };

  handleSaveSchedule = async () => {
    let validateReturn = this.handleValidateSave();
    if (validateReturn !== '') {
      alerta(validateReturn, 1);
      return;
    }
    const { empresaAtiva, usuarioAtivo, flow, searchs, newFlow } = this.state;
    try {
      // this.setState({ loading: true });
      let url;
      let data = {
        flow,
        searchs,
      };
      //console.log(data);
      let retorno;
      if (newFlow) {
        url = '/v1/flows/add/' + empresaAtiva + '/' + usuarioAtivo;
        retorno = await api.post(url, data);
      } else {
        url = '/v1/flows/' + empresaAtiva + '/' + usuarioAtivo;
        retorno = await api.put(url, data);
      }

      if (retorno.data.sucess) {
        alerta('Fluxo salvo com sucesso!', 0);
        this.props.history.goBack();
      }
      this.setState({ loading: false });
    } catch (err) {
      alerta('Erro ao salvar o agendamento =>' + err, 2);
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, flow, searchs, selectAll } = this.state;
    return (
      <>
        <Header />
        <WaitScreen loading={loading} />
        <Container className="containerFlow">
          <DirectTituloJanela
            urlVoltar={'/flows'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>account_tree</Icon>Fluxo pesquisas
                </span>
              )
            }
          />
          <Linha className="topLine" style={{ alignItems: 'center' }}>
            <DivDetalhe flex={3}>
              <Labels>Descrição</Labels>
              <input
                type="text"
                onChange={this.onchangeDescription}
                value={flow !== undefined ? flow.GAF_DESCRICAO : ''}
              />
            </DivDetalhe>
            <DivDetalhe flex={1}>
              <Labels>Tipo de fluxo</Labels>
              <select
                name="tipoDeFluxo"
                id="tipoDeFluxo"
                style={{
                  display: 'flex',
                }}
                value={
                  flow !== undefined ? String(flow.GAF_FLG_TIPO_USUARIO) : ''
                }
                onChange={this.onChangeFlowType}
              >
                <option value="0">Supervisor</option>
                <option value="1">Promotor</option>
              </select>
            </DivDetalhe>
            <DivDetalhe>
              <Checkbox
                id="Checkbox_3"
                label="Ativa"
                value="1"
                checked={
                  flow !== undefined && flow.GAF_FLG_STATUS !== undefined
                    ? flow.GAF_FLG_STATUS === 1
                    : false
                }
                onChange={this.onChangeFlowActive}
              />
            </DivDetalhe>
          </Linha>

          {searchs !== undefined && searchs.length > 0 && (
            <>
              <Linha style={{ paddingTop: '60px' }}>
                <Labels style={{ display: 'flex', flexDirection: 'row' }}>
                  <Icon>poll</Icon>Selecione e ordene as pesquisas
                </Labels>
              </Linha>
              <Linha>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <Checkbox
                          className="customerSelector"
                          checked={selectAll}
                          label=""
                          value="true"
                          id={`selectAllCustomer`}
                          onChange={() => this.onClickSelectAll()}
                        />
                      </th>
                      <th
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          this.handleOrderBy('CLI_RAZAO_SOCIAL');
                        }}
                      >
                        Descrição pesquisa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchs.map((search, i) => {
                      if (search.GAP_FLG_STATUS !== 0) {
                        return (
                          <React.Fragment key={i}>
                            <tr
                              style={{
                                backgroundColor:
                                  search.counter % 2 !== 0
                                    ? 'rgb(223, 178, 251)'
                                    : 'white',
                              }}
                            >
                              <td>
                                <Linha
                                  className="checkBoxLine"
                                  style={{ alignItems: 'center' }}
                                >
                                  <Checkbox
                                    label=""
                                    value="true"
                                    id={`searchs${search.GAP_ID} searchsCheckbox`}
                                    checked={search?.checked}
                                    onChange={(e) =>
                                      this.onClickSelectSearch(e, search)
                                    }
                                  />
                                  {search.checked && (
                                    <>
                                      <Button
                                        className="waves-effect waves-light saib-button is-primary"
                                        onClick={() => this.onMakeUp(search)}
                                      >
                                        <Icon>arrow_upward</Icon>
                                      </Button>
                                      <Button
                                        className="waves-effect waves-light saib-button is-primary"
                                        onClick={() => this.onMakeDown(search)}
                                      >
                                        <Icon>arrow_downward</Icon>
                                      </Button>
                                    </>
                                  )}
                                </Linha>
                              </td>
                              <td style={{ width: '80%' }}>
                                <p>
                                  {search.GAP_ID} - {search.GAP_DESCRICAO}
                                </p>
                                <small>{search.GAP_DESCRICAO_LONGA}</small>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      } else return '';
                    })}
                    <tr></tr>
                  </tbody>
                </table>
              </Linha>
            </>
          )}
          <Linha style={{ marginTop: '30px', justifyContent: 'flex-end' }}>
            <DivDetalhe>
              <Button
                className="waves-effect waves-light saib-button is-primary"
                onClick={() => this.props.history.goBack()}
              >
                <Icon>arrow_back</Icon>Cancelar
              </Button>
            </DivDetalhe>
            <DivDetalhe>
              <Button
                className="waves-effect waves-light saib-button is-primary"
                onClick={() => this.handleSaveSchedule()}
              >
                <Icon>save</Icon>Salvar
              </Button>
            </DivDetalhe>
          </Linha>
        </Container>
      </>
    );
  }
}

export default withRouter(Flow);
