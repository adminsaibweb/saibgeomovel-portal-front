import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Labels, Titulo, Container, Linha, DivDetalhe } from '../style';
import { getFromStorage } from '../../../../services/auth';
import { Icon } from 'react-materialize';
import { alerta, capitalize, getScheduleData, randomNumber, updateScheduleData } from '../../../../services/funcoes';
import './forced.css';
import { haveData } from '../../../../services/funcoes';
import { getLocalObject, setLocalObject, setGps } from '../../../../services/databaseLocal';
import sku from '../../../../assets/images/sku.png';
import FieldSearch from '../FieldSearch';
import { syncLocationData } from '../tradeGlobalFunctions';
class StartSearchGrouped extends Component {
  state = {
    loaging: false,
    lastChange: -1,
    cliente: undefined,
    userHours: undefined,
    pesquisas: undefined,
    position: 0,
    perguntaAnterior: undefined,
    proximaPergunta: undefined,
    perguntaAtual: undefined,
    maxPosition: 0,
    progress: 0,
    selectedItemId: undefined,
    lastUpdate: 0,
    hasChanged: 0,
  };

  componentDidMount = async () => {
    let { cliente, agrupamentos, pesquisas, userHours } = this.state;

    let scheduleData = await getScheduleData()

    let clienteAtendimento = this.props?.history?.location?.state?.cliente || {};

    let idPesquisa = this.props?.history?.location?.state?.pesquisa?.GFP_ID;
    userHours = this.props?.history?.location?.state?.userHours || {};;
    cliente = scheduleData.CLIENTES.find((cli) => cli.CLI_ID === clienteAtendimento.CLI_ID);
    let pesquisaData = await getLocalObject('perguntas') || this.props?.history?.location?.state?.pesquisas || {};

    if (pesquisaData !== '') {
      pesquisas = pesquisaData;
      if (haveData(pesquisaData)) {
        agrupamentos = pesquisaData.find((item) => item.GFP_ID === idPesquisa)?.DETALHAMENTO[0]?.AGRUPAMENTO || [];
      } else {
        agrupamentos = pesquisaData ? pesquisaData[0].AGRUPAMENTO : [];
      }
    } else {
      if (haveData(cliente?.pesquisas)) {
        agrupamentos = cliente?.pesquisas.find((item) => item.GFP_ID === idPesquisa)?.DETALHAMENTO[0]?.AGRUPAMENTO || [];

        pesquisas = cliente?.pesquisas;
      } else {
        agrupamentos = this.props?.history?.location?.state?.perguntas[0]?.AGRUPAMENTO || [];
        pesquisas = this.props?.history?.location?.state?.pesquisas || {};
      }
    }

    this.setState({
      cliente,
      scheduleData,
      agrupamentos,
      pesquisas,
      userHours,
    });
    this.carregarVariaveisEstado();
    this.markRequiredAgrupamentos();
    // setInterval(() => {
    //   this.getActualPosition();
    // }, EnviromentVars.gpsRefresh);
  };

  markRequiredAgrupamentos = () => {
    let { agrupamentos } = this.state;

    let findProblem = false;
    let findProblemItem = false;

    for (let agrupamento of agrupamentos) {
      findProblem = false;
      for (let item_ of agrupamento.ITEMS) {
        findProblemItem =
          item_.PERGUNTAS.find((item) => {
            return (
              item.GPP_FLG_ORIGATORIA !== 0 && !haveData(item.RESPOSTA) && item_.GGI_FLG_ORIGATORIA_NAO_APLICA === 0
            );
          }) !== undefined;
        item_.RED = findProblemItem;
        if (findProblemItem && !findProblem) {
          findProblem = true;
        }
      }
      agrupamento.RED = findProblem;
    }

    this.setState({ agrupamentos });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      frotaId: sessao.frotaId,
      gmovel: sessao.gmovel,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
    });
  };

  getActualPosition = async () => {
    let { lastUpdate } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  onUpdateCoord = (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;
    syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
    this.setState({ latitude: coords.latitude, longitude: coords.longitude });
    setGps(coords.latitude, coords.longitude);
  };

  allQuestionsHaveResponses = async (item) => {
    let { selectedItem } = this.state;

    if (selectedItem === undefined) {
      selectedItem = item;
    }
    if (selectedItem === undefined) {
      return true;
    }

    for (let pergunta of selectedItem.PERGUNTAS) {
      pergunta.RED =
        pergunta.GPP_FLG_ORIGATORIA !== 0 &&
        selectedItem.GGI_FLG_ORIGATORIA_NAO_APLICA === 0 &&
        (pergunta.RESPOSTA === undefined || pergunta.RESPOSTA === '' || pergunta.RESPOSTA === 'limpar');
    }
    this.setState({
      selectedItem: selectedItem,
    });

    let temAlertas = selectedItem.PERGUNTAS.find((item) => item.RED) !== undefined;
    return !temAlertas;
  };

  handleSelectedItem = async (item) => {
    // let { agrupamento } = this.state;
    if ((await this.allQuestionsHaveResponses()) === false) {
      alerta('Você não respondeu todas as perguntas da pesquisa.', 3);
      return;
    }

    this.markRequiredAgrupamentos();
    let selectedItemPosition = this.getItemPosition(item.GGI_ID);
    this.setState({
      selectedItem: item,
      selectedItemId: item.GGI_ID,
      selectedItemPosition,
    });
  };

  handleSelectedAgrupamento = (agrupamento) => {
    let selectedAgrupaId = agrupamento.GGR_ID;
    let selectedAgrupaItemId = agrupamento.ITEMS.length > 0 ? agrupamento.ITEMS[0].GGI_ID : undefined;
    let selectedAgrupaItem = agrupamento.ITEMS.length > 0 ? agrupamento.ITEMS[0] : undefined;

    this.setState({
      agrupamento,
      selectedAgrupaId,
      selectedItemId: selectedAgrupaItemId,
      selectedItem: selectedAgrupaItem,
    });
  };

  handleBackSearch = (cliente, pesquisas) => {
    //console.log('handleBackSearch =>' + cliente);
  };

  getProgress = () => {
    let { position, maxPosition } = this.state;
    let retorno = maxPosition > 0 ? (100 * (position + 1)) / maxPosition : 0;

    return retorno;
  };

  handleChangePosition = (add = '+') => {
    let { position, perguntaAtual, perguntas } = this.state;
    position = add === '-' ? position - 1 : position + 1;
    perguntaAtual = perguntas[position];
    this.setState({ position, perguntaAtual });
  };

  handleChangeSearch = (newPosition) => {
    let { perguntas } = this.state;
    let perguntaAtual = perguntas[newPosition];
    this.setState({ perguntaAtual });
  };

  getItemPosition = (selectedItemId) => {
    let { agrupamento } = this.state;
    let cont = 0;
    for (const item of agrupamento.ITEMS) {
      if (selectedItemId === item.GGI_ID) {
        return cont;
      }
      cont += 1;
    }
  };

  handleOnChangeResposta = async (e, pergunta, _campo) => {
    let { selectedItem, agrupamento, hasChanged } = this.state;

    if (e !== undefined && e.target === undefined && e.formattedValue === undefined) {
      let _pergunta = selectedItem.PERGUNTAS.findIndex((item) => item.GPP_ID === pergunta.GPP_ID);

      if (_pergunta !== -1) {
        selectedItem.PERGUNTAS[_pergunta].RESPOSTA = e || '';
      }
    }

    if (e.floatValue !== undefined) {
      let _pergunta = selectedItem.PERGUNTAS.find((item) => item.GPP_ID === pergunta.GPP_ID);
      if (_pergunta) {
        _pergunta.RESPOSTA = e.floatValue || '';
      }
    }

    if (e.target !== undefined && e.target.type === 'checkbox') {
      if (pergunta.GPP_TIPO_CAMPO === 11) {
        //console.log(e.target.checked);
        let _pergunta = selectedItem.PERGUNTAS.find((item) => item.GPP_ID === pergunta.GPP_ID);
        if (!haveData(_pergunta.RESPOSTA)) {
          _pergunta.RESPOSTA = [];
        }
        if (e.target.checked) {
          if (_pergunta.RESPOSTA.find((item) => item === _campo.GAC_ID) === undefined) {
            _pergunta.RESPOSTA.push(_campo.GAC_ID);
          }
        } else {
          if (_pergunta.RESPOSTA.find((item) => item === _campo.GAC_ID) !== undefined) {
            let position = _pergunta.RESPOSTA.indexOf(_campo.GAC_ID);
            _pergunta.RESPOSTA = _pergunta.RESPOSTA.splice(position, 1);
          }
        }
      } else {
        //console.log(e.target.checked);
        let _pergunta = selectedItem.PERGUNTAS.find((item) => item.GPP_ID === pergunta.GPP_ID);
        if (_pergunta) {
          _pergunta.RESPOSTA = _campo.GAC_ID || '';
        }
      }
    }

    if (
      (e.target !== undefined && e.target.type === 'text' && e.floatValue === undefined) ||
      (e.target !== undefined && e.target.className === 'spanNps')
    ) {
      let _pergunta = selectedItem.PERGUNTAS.find((item) => item.GPP_ID === pergunta.GPP_ID);
      if (_pergunta) {
        if (e.target.className === 'spanNps') {
          _pergunta.RESPOSTA = parseInt(e.target.innerText) || '';
        } else {
          _pergunta.RESPOSTA = e.target.value || '';
        }
      }
      // position += 1;
    }

    if (e.target !== undefined && e.type === 'click') {
      let _pergunta = selectedItem.PERGUNTAS.find((item) => item.GPP_ID === pergunta.GPP_ID);
      if (_pergunta) {
        _pergunta.RESPOSTA = parseInt(e.target.innerText) || '';
      }
    }

    hasChanged += 1;

    this.setState({
      agrupamento,
      selectedItem,
      hasChanged,
      // proximaPergunta,
    });

    await this.handleCommit();
  };

  handleGotoNext = async () => {
    let { proximaPergunta, perguntaAtual, position, perguntas, perguntaAnterior } = this.state;

    if (perguntaAtual.GPP_TIPO_CAMPO === 8 || perguntaAtual.GPP_TIPO_CAMPO === 10) {
      if (!haveData(perguntaAtual.RESPOSTA)) {
        position += 1;
      } else {
        for (const campo of perguntaAtual.CAMPOS) {
          if (campo.GAC_ID === perguntaAtual.RESPOSTA) {
            if (campo.GAC_GPP_ID_PROXIMA != null) {
              position = await this.getPositionPergunta(campo.GAC_GPP_ID_PROXIMA);
              break;
            } else {
              position += 1;
              break;
            }
          }
        }
      }
    } else {
      position += 1;
    }

    perguntaAnterior = perguntaAtual;
    perguntaAtual = perguntas[position];
    proximaPergunta = undefined;

    this.setState({
      proximaPergunta,
      perguntaAtual,
      position,
      perguntaAnterior,
    });

    if (perguntaAtual === undefined) {
      document.getElementsByClassName('voltarServiceSearchs')[0].click();
    }
  };

  handleGotoPrior = async () => {
    let { perguntaAnterior, perguntaAtual, proximaPergunta } = this.state;

    if (perguntaAnterior === perguntaAtual || perguntaAnterior === undefined) {
      document.getElementsByClassName('voltarServiceSearchs')[0].click();
      return;
    }
    proximaPergunta = perguntaAtual;
    perguntaAtual = perguntaAnterior;
    perguntaAnterior = undefined;

    this.setState({ perguntaAnterior, perguntaAtual, proximaPergunta });
  };

  handleCommit = async () => {
    let { scheduleData, cliente, pesquisas } = this.state;

    for (const cli of scheduleData.CLIENTES) {
      if (cli.CLI_ID === cliente?.CLI_ID) {
        cli.pesquisas = pesquisas;
      }
    }
    scheduleData.imagesChanged = true;
    await updateScheduleData(scheduleData)
    await setLocalObject('perguntas', pesquisas);
    this.setState({ scheduleData });
  };

  render() {
    const {
      hasChanged,
      pesquisas,
      cliente,
      agrupamento,
      agrupamentos,
      selectedItemId,
      selectedAgrupaId,
      selectedItem,
      userHours
    } = this.state;
    return (
      <>
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
            zIndex: '2',
          }}
        >
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            onClick={async () => {
              document.getElementsByClassName('voltarServiceSearchs')[0].click();
            }}
            className="waves-effect waves-light saib-button is-cancel"
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>
            {agrupamento !== undefined ? agrupamento.GGR_DESCRICAO_LONGA : 'Em atendimento'}
          </p>
        </Titulo>
        <Container className="startSearchGrouped">
          {/* <TradeLocation
            onUpdateCoord={this.onUpdateCoord}
            lastUpdate={lastUpdate}
          /> */}
          {agrupamentos !== undefined && (
            <>
              <Linha className="linhaAgrupamentoTitulo">
                <Linha className="linhaAgrupamento">
                  {agrupamentos.map((item) => (
                    <React.Fragment key={item.GGR_ID}>
                      <DivDetalhe
                        className="itemAgrupamento"
                        onClick={() => this.handleSelectedAgrupamento(item)}
                        style={{
                          border: selectedAgrupaId === item.GGR_ID ? '3px solid #8e44ad' : 'unset',
                        }}
                      >
                        <Labels
                          style={{
                            textDecorationLine: item.RED ? 'underline' : 'unset',
                            textDecorationStyle: item.RED ? 'wavy' : 'unset',
                            textDecorationColor: item.RED ? 'red' : 'unset',
                          }}
                        >
                          {capitalize(item.GGR_DESCRICAO.toLowerCase())}
                        </Labels>
                      </DivDetalhe>
                    </React.Fragment>
                  ))}
                </Linha>
                {agrupamento !== undefined && (
                  <>
                    <Linha className="linhaItemAgrupamentoTitulo">
                      {agrupamento.ITEMS.map((item) => (
                        <React.Fragment key={item.GGI_ID}>
                          <DivDetalhe
                            className="itemAgrupamento"
                            onClick={() => this.handleSelectedItem(item)}
                            style={{
                              border: selectedItemId === item.GGI_ID ? '3px solid #8e44ad' : 'unset',
                            }}
                          >
                            <img
                              src={sku}
                              alt={item.GGI_DESCRICAO}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                              className="skuImage"
                            />
                            <Labels
                              style={{
                                textDecorationLine: item.RED ? 'underline' : 'unset',
                                textDecorationStyle: item.RED ? 'wavy' : 'unset',
                                textDecorationColor: item.RED ? 'red' : 'unset',
                              }}
                            >
                              {capitalize(item.GGI_DESCRICAO.toLowerCase())}
                            </Labels>
                          </DivDetalhe>
                        </React.Fragment>
                      ))}
                    </Linha>
                    {selectedItem !== undefined && (
                      <div
                        style={{
                          border: '1px solid #8e44ad',
                          width: '100%',
                          paddingTop: '0px',
                        }}
                      >
                        <Linha className="linhaItemPertuntasTitulo">
                          <Labels fontWeight="700" fontSize="1.0rem" color="white">
                            {selectedItem.GGI_DESCRICAO_LONGA}
                          </Labels>
                        </Linha>
                        {selectedItem.PERGUNTAS.filter(e => e.GPP_FLG_STATUS === 1).map((pergunta, indice) => (
                          <React.Fragment key={pergunta.GPP_ID}>
                            {pergunta.GPP_FLG_STATUS === 1 && (
                              <React.Fragment key={randomNumber()}>
                                <Linha className="linhaCampos">
                                  <Labels
                                    fontWeight="500"
                                    fontSize="1.2rem"
                                    style={{
                                      textDecorationLine: pergunta.RED ? 'underline' : 'unset',
                                      textDecorationStyle: pergunta.RED ? 'wavy' : 'unset',
                                      textDecorationColor: pergunta.RED ? 'red' : 'unset',
                                    }}
                                  >
                                    {pergunta.GPP_PERGUNTA}
                                  </Labels>
                                  <Labels
                                    fontWeight="700"
                                    fontSize="1.5rem"
                                    color="red"
                                    style={{
                                      display:
                                        selectedItem.GGI_FLG_ORIGATORIA_NAO_APLICA === 0 &&
                                        (pergunta.GPP_FLG_ORIGATORIA === 1 || pergunta.GPP_FLG_ORIGATORIA === -1)
                                          ? 'block'
                                          : 'none',
                                    }}
                                  >
                                    *
                                  </Labels>
                                </Linha>
                                {pergunta.CAMPOS.map((campo) => (
                                  <React.Fragment key={campo.GAC_ID}>
                                    {campo.GAC_FLG_STATUS === 1 && (
                                      <Linha className="linhaCampo">
                                        <FieldSearch
                                          campo={campo}
                                          pergunta={pergunta}
                                          resposta={pergunta.RESPOSTA}
                                          onChange={this.handleOnChangeResposta}
                                          tipoCampo={pergunta.GPP_TIPO_CAMPO}
                                          hasChanged={hasChanged}
                                        />
                                      </Linha>
                                    )}
                                  </React.Fragment>
                                ))}
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </Linha>
            </>
          )}

          {/* <FooterPage
            className="footerTrader foi"
            style={{
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <Button
              className="waves-effect waves-light saib-button is-primary"
              onClick={() => this.handleGotoPrior()}
            >
              <Icon>arrow_back_ios</Icon>Anterior
            </Button>
            {position < maxPosition && (
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => this.handleGotoNext()}
                >
                  Próxima<Icon>arrow_forward_ios</Icon>
                </Button>
              </>
            )}

          </FooterPage> */}
          <Link
            className={`voltarServiceSearchs`}
            style={{ display: 'none' }}
            to={{
              pathname: '/ServiceSearchs',
              state: {
                cliente,
                agrupamento,
                userHours,
                pesquisas,
                forceCommit: true,
              },
            }}
          ></Link>
        </Container>
      </>
    );
  }
}

export default withRouter(StartSearchGrouped);

