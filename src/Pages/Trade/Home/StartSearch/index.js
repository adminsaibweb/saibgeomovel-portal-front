import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Labels, Titulo, Container, Linha, FooterPage } from '../style';
import { getFromStorage } from '../../../../services/auth';
import { Icon, Button } from 'react-materialize';
import './forced.css';
import { haveData, alerta, updateScheduleData, getScheduleData } from '../../../../services/funcoes';
import { setLocalObject, setGps } from '../../../../services/databaseLocal';
import FieldSearch from '../FieldSearch';
import { syncLocationData } from '../tradeGlobalFunctions';

class StartSearch extends Component {
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
    hasChanged: 0,
    lastUpdate: 0,
    progress: 0,
  };

  componentDidMount = async () => {
    let { cliente, perguntas, perguntaAtual, position, maxPosition, pesquisas, userHours } = this.state;

    let scheduleData = await getScheduleData()

    cliente = this.props?.history?.location?.state?.cliente || {};
    const LsPerguntas = scheduleData.CLIENTES.find((data) => data.CLI_ID === cliente.CLI_ID)?.pesquisas.find(
      (data) => data.GAP_DESCRICAO === this.props?.history?.location?.state?.perguntas[0]?.GAP_DESCRICAO
    )?.DETALHAMENTO;

    if (LsPerguntas && LsPerguntas.length > 0) {
      perguntas = LsPerguntas[0].PERGUNTAS.filter(e => e.GPP_FLG_STATUS === 1);
      pesquisas = scheduleData.CLIENTES.find((data) => data.CLI_ID === cliente.CLI_ID)?.pesquisas;
    } else {
      perguntas = this.props?.history?.location?.state?.perguntas[0].PERGUNTAS.filter(e => e.GPP_FLG_STATUS === 1);
      pesquisas = this.props?.history?.location?.state?.pesquisas || {};
    }

    userHours = this.props?.history?.location?.state?.userHours || {};
    if (perguntas && perguntas.length > 0) {
      perguntaAtual = perguntas[position];
      maxPosition = perguntas.length + 1;
    }


    this.setState({
      cliente,
      scheduleData,
      perguntas,
      perguntaAtual,
      maxPosition,
      pesquisas,
      userHours,
    });
    this.carregarVariaveisEstado();
    // setInterval(() => {
    //   this.getActualPosition();
    // }, EnviromentVars.gpsRefresh);
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

  handleBackSearch = (cliente, pesquisas) => {
    //console.log('handleBackSearch =>' + cliente);
  };

  getProgress = () => {
    let { position, maxPosition } = this.state;
    let retorno = maxPosition > 0 ? (100 * (position + 1)) / maxPosition : 0;
    //console.log('1.getProgress=>' + retorno);
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

  getPositionPergunta = async (perguntaId) => {
    let { perguntas } = this.state;
    let cont = 0;
    for (const pergunta of perguntas) {
      if (perguntaId === pergunta.GPP_ID) {
        return cont;
      }
      cont += 1;
    }
  };

  handleOnChangeResposta = async (e, pergunta, _campo) => {
    let { perguntas, agrupamento, hasChanged } = this.state;

    if (e !== undefined && e.target === undefined && e.formattedValue === undefined) {
      let _pergunta = perguntas.find((item) => item.GPP_ID === pergunta.GPP_ID);

      if (pergunta.GPP_TIPO_CAMPO === 7) {
        //await setImagesChanged(true)
      }
      if (_pergunta) {
        _pergunta.RESPOSTA = e;
      }

    }

    if (e.floatValue !== undefined) {
      let _pergunta = perguntas.find((item) => item.GPP_ID === pergunta.GPP_ID);
      if (_pergunta) {

        _pergunta.RESPOSTA = e.floatValue;
      }
    }

    if (e.target !== undefined && e.target.type === 'checkbox') {
      if (pergunta.GPP_TIPO_CAMPO === 11) {
        //console.log(e.target.checked);
        let _pergunta = perguntas.find((item) => item.GPP_ID === pergunta.GPP_ID);
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
        let _pergunta = perguntas.find((item) => item.GPP_ID === pergunta.GPP_ID);
        if (_pergunta) {
          _pergunta.RESPOSTA = _campo.GAC_ID;

        }
      }
    }

    let nameClassName = e?.target?.className?.includes("botaoNps") || e?.target?.className?.includes("spanNps")

    if (
      (e.target !== undefined && e.target.type === 'text' && e.floatValue === undefined) ||
      (e.target !== undefined && nameClassName)
    ) {
      let _pergunta = perguntas.find((item) => item.GPP_ID === pergunta.GPP_ID);
      if (_pergunta) {
        if (nameClassName) {
          _pergunta.RESPOSTA = parseInt(e.target.innerText);
        } else {
          _pergunta.RESPOSTA = e.target.value;
        }

      }
      // position += 1;
    }

    hasChanged += 1;

    this.setState({
      agrupamento,
      perguntas,
      hasChanged,
      // proximaPergunta,
    });
    await this.handleCommit();
  };

  handleGotoNext = async () => {
    let { proximaPergunta, perguntaAtual, position, perguntas, perguntaAnterior } = this.state;

    if (await this.handleBloquearPorObrigatoriedade()) {
      alerta('Pergunta de resposta obrigatória.', 2);
      return;
    }

    // if (perguntaAtual.GPP_TIPO_CAMPO === 8 || perguntaAtual.GPP_TIPO_CAMPO === 10) {
    //   if (!haveData(perguntaAtual.RESPOSTA)) {
    //     position += 1;
    //   } else {
    //     for (const campo of perguntaAtual.CAMPOS) {
    //       if (campo.GAC_ID === perguntaAtual.RESPOSTA) {
    //         if (campo.GAC_GPP_ID_PROXIMA != null) {
    //           position = await this.getPositionPergunta(campo.GAC_GPP_ID_PROXIMA);
    //           break;
    //         } else {
    //           position += 1;
    //           break;
    //         }
    //       }
    //     }
    //   }
    // } else {
    //   position += 1;
    // }

    if (perguntas.findIndex((item) => item.GPP_ID === perguntaAtual.GPP_ID) !== perguntas.length -1 ) {
      perguntaAnterior = perguntaAtual;
      perguntaAtual = perguntas[perguntas.findIndex((item) => item.GPP_ID === perguntaAtual.GPP_ID) + 1];
      proximaPergunta = perguntas[perguntas.findIndex((item) => item.GPP_ID === perguntaAtual.GPP_ID) + 1];
    }
    else {

      if (document.getElementsByClassName('voltarServiceSearchs')[0] === undefined) {
        this.handleVoltarServiceSearchs();
      } else {
        document.getElementsByClassName('voltarServiceSearchs')[0].click();
      }
    }

    this.setState({
      proximaPergunta,
      perguntaAtual,
      position,
      perguntaAnterior,
    });

  };

  handleVoltarServiceSearchs = () => {
    let { cliente, pesquisas, userHours } = this.state;
    this.props.history.push({
      pathname: '/ServiceSearchs',
      state: {
        userHours,
        cliente,
        pesquisas,
        forceCommit: true,
      },
    });
  };

  handleBloquearPorObrigatoriedade = async () => {
    let { perguntaAtual } = this.state;

    if (perguntaAtual === undefined) {
      return false;
    } else {
      return perguntaAtual.GPP_FLG_ORIGATORIA === 1 &&
        (perguntaAtual.RESPOSTA === '' || perguntaAtual.RESPOSTA === undefined)
        ? true
        : false;
    }
  };

  handleGotoPrior = async () => {
    let { perguntaAnterior, perguntaAtual, proximaPergunta, perguntas } = this.state;
    if (await this.handleBloquearPorObrigatoriedade()) {
      alerta('Pergunta de resposta obrigatória.', 2);
      return;
    }
    if (perguntaAnterior === perguntaAtual || perguntaAnterior === undefined) {
      if (perguntaAtual === undefined) {
        if (document.getElementsByClassName('voltarServiceSearchs')[0] === undefined) {
          this.handleVoltarServiceSearchs();
        } else {
          document.getElementsByClassName('voltarServiceSearchs')[0].click();
        }
      }
      return;
    }

    proximaPergunta = perguntas[perguntas.findIndex((item) => item.GPP_ID === perguntaAtual.GPP_ID) + 1];
    perguntaAtual = perguntaAnterior;
    perguntaAnterior = perguntas[perguntas.findIndex((item) => item.GPP_ID === perguntaAtual.GPP_ID) - 1];

    this.setState({ perguntaAnterior, perguntaAtual, proximaPergunta });
  };

  handleCommit = async () => {
    let { scheduleData, cliente, pesquisas } = this.state;
    for (const cli of scheduleData.CLIENTES) {
      if (cli.CLI_ID === cliente.CLI_ID) {
        cli.pesquisas = pesquisas;
      }
    }
    scheduleData.imagesChanged = true
    await updateScheduleData(scheduleData)
    await setLocalObject('perguntas', pesquisas);
    this.setState({ scheduleData });
  };

  render() {
    const { perguntaAtual, position, maxPosition, pesquisas, cliente, hasChanged, userHours } = this.state;
    return (
      <>
        {/* <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate}/> */}
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
              if (await this.handleBloquearPorObrigatoriedade()) {
                alerta('Pergunta de resposta obrigatória.', 2);
                return;
              }
              if (document.getElementsByClassName('voltarServiceSearchs')[0] === undefined) {
                this.handleVoltarServiceSearchs();
              } else {
                document.getElementsByClassName('voltarServiceSearchs')[0].click();
              }
            }}
            className="waves-effect waves-light saib-button is-cancel"
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Em atendimento</p>
        </Titulo>
        {perguntaAtual !== undefined && (
          <>
            <Container className="startSearch">
              <Linha
                style={{ textAlign: 'center', paddingTop: '20px', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Labels fontWeight="700" fontSize="1.5rem">
                  {perguntaAtual.GPP_PERGUNTA}
                </Labels>
                <Labels
                  fontWeight="700"
                  fontSize="1.5rem"
                  color="red"
                  style={{ display: perguntaAtual.GPP_FLG_ORIGATORIA === 1 ? 'block' : 'none' }}
                >
                  *
                </Labels>
              </Linha>
              <Linha>
                <Linha>
                  {perguntaAtual?.CAMPOS.map((campo) => (
                    <React.Fragment key={campo.GAC_ID}>
                      {campo.GAC_FLG_STATUS === 1 && (
                        <FieldSearch
                          campo={campo}
                          pergunta={perguntaAtual}
                          resposta={perguntaAtual.RESPOSTA}
                          onChange={this.handleOnChangeResposta}
                          tipoCampo={perguntaAtual.GPP_TIPO_CAMPO}
                          hasChanged={hasChanged}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Linha>
              </Linha>
              <FooterPage
                className="footerTrader"
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
                <Link
                  className={`voltarServiceSearchs`}
                  style={{ display: 'none' }}
                  to={{
                    pathname: '/ServiceSearchs',
                    state: {
                      userHours,
                      cliente,
                      pesquisas,
                      forceCommit: true,
                    },
                  }}
                ></Link>
              </FooterPage>
            </Container>
          </>
        )}
      </>
    );
  }
}

export default withRouter(StartSearch);
