import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { getFromStorage } from '../../../../../services/auth';
import { dateFormat } from '../../../../../services/funcoes';
import { ContentCardDetailsTrade, TotalAlerts, Separator, ContentDetailsTrade, Content } from './styled';

export default class TradeDetailsIndicator extends Component {
  state = {
    loading: false,
    today: dateFormat(new Date(), 'DD/MM/yyyy'),
    notStarted: 0,
    started: 0,
    finished: 0,
    progress: 0,
    paused: 0,
    totalTrade: 0,
    tradeAgroupeds: {},
  };

  async componentDidMount() {
    this.mounted = true;
    await this.carregarVariaveisEstado();
    this.handleTradeIndicators().then(() => {
      setTimeout(() => {
        if (this.mounted) {
          this.setState({
            loading: false,
          });
        }
      }, 600);
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      if (this.mounted) {
        this.setState({
          loading: true,
        });

        this.handleTradeIndicators().then(() => {
          setTimeout(() => {
            this.setState({
              loading: false,
            });
          }, 600);
        });
      }
    }

    if (prevProps.forceLoading !== this.props.forceLoading) {
      if (this.mounted) {
        this.setState({
          loading: this.props.forceLoading,
        });
      }
    }
  }

  agroupedDataTrade = async (data) => {
    if (this.mounted) {
      const tradeAgrouped =
        data &&
        data.reduce(
          (
            h,
            {
              GAA_USR_ID_AGENDA,
              USR_NOME,
              ATD_TOTAL,
              ATD_ANDAMENTO,
              ATD_FINALIZADO,
              ATD_JUSTIFICADOS,
              ATD_PAUSADO,
              INICIO_DIA,
              FIM_DIA,
            }
          ) => {
            return Object.assign(h, {
              [GAA_USR_ID_AGENDA]: (h[GAA_USR_ID_AGENDA] || []).concat({
                USR_NOME,
                ATD_TOTAL,
                ATD_ANDAMENTO,
                ATD_FINALIZADO,
                ATD_JUSTIFICADOS,
                ATD_PAUSADO,
                INICIO_DIA,
                FIM_DIA,
              }),
            });
          },
          {}
        );

      await (async () => {
        this.setState({
          tradeAgroupeds: tradeAgrouped,
        });
      })();
    }
  };

  handleTradeIndicators = async () => {
    if (this.mounted) {
      const data = [...this.props.data];

      await this.agroupedDataTrade(data);
      await (async () => {
        this.verifyIfStartedDay();
        this.verifyFinishedDay();
        this.verifyInAttendance();
        this.verifyIfPaused();
      })();
      if (data && data.length > 0) {
        let countSchedules = Object.values(this.state.tradeAgroupeds).length;
        let started = 0;
        let progress = 0;
        let finished = 0;
        let paused = 0;

        Object.keys(this.state.tradeAgroupeds).forEach((key) => {
          const colaborator = this.state.tradeAgroupeds[key];
          started += colaborator.startedDay ? 1 : 0;
          finished += colaborator.finishedDay ? 1 : 0;
          progress += colaborator.inAttendance ? 1 : 0;
          paused += colaborator.isPaused ? 1 : 0;
        });

        this.setState({
          totalTrade: countSchedules,
          finished,
          progress,
          paused,
          started,
        });
      }
    }
  };

  verifyIfStartedDay = () => {
    const { tradeAgroupeds } = this.state;
    const totalColaborators = Object.values(tradeAgroupeds).length;
    let countColaboratorsStartedDay = 0;
    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      colaborator.every((dataColaborator) => {
        if (dataColaborator.INICIO_DIA) {
          tradeAgroupeds[key].startedDay = true;
          return false;
        } else {
          tradeAgroupeds[key].startedDay = false;
          return true;
        }
      });
    });

    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      if (colaborator.startedDay) countColaboratorsStartedDay++;
    });

    this.setState({
      started: countColaboratorsStartedDay,
      notStarted: totalColaborators - countColaboratorsStartedDay,
    });
  };

  verifyFinishedDay = () => {
    const { tradeAgroupeds } = this.state;
    let countColaboratorsFinishedDay = 0;
    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      colaborator.every((dataColaborator) => {
        if (dataColaborator.FIM_DIA) {
          tradeAgroupeds[key].finishedDay = true;
          return false;
        } else {
          tradeAgroupeds[key].finishedDay = false;
          return true;
        }
      });
    });

    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      if (colaborator.finishedDay) countColaboratorsFinishedDay++;
    });
    this.setState({
      finished: countColaboratorsFinishedDay,
    });
  };

  verifyInAttendance = () => {
    const { tradeAgroupeds } = this.state;
    let countColaboratorsInAttendance = 0;
    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      colaborator.every((dataColaborator) => {
        if (dataColaborator.ATD_ANDAMENTO) {
          tradeAgroupeds[key].inAttendance = true;
          return false;
        } else {
          tradeAgroupeds[key].inAttendance = false;
          return true;
        }
      });
    });

    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      if (colaborator.inAttendance) countColaboratorsInAttendance++;
    });
    this.setState({
      progress: countColaboratorsInAttendance,
    });
  };

  verifyIfPaused = () => {
    const { tradeAgroupeds } = this.state;
    let countColaboratorsPaused = 0;
    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      colaborator.every((dataColaborator) => {
        if (dataColaborator.ATD_PAUSADO) {
          tradeAgroupeds[key].isPaused = true;
          return false;
        } else {
          tradeAgroupeds[key].isPaused = false;
          return true;
        }
      });
    });

    Object.keys(tradeAgroupeds).forEach((key) => {
      const colaborator = tradeAgroupeds[key];
      if (colaborator.isPaused) countColaboratorsPaused++;
    });
    this.setState({
      paused: countColaboratorsPaused,
    });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  render() {
    const { loading, notStarted, finished, started, progress, paused, tradeAgroupeds } = this.state;

    return (
      <Content>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={60} width={250} />
          </div>
        ) : (
          <ContentCardDetailsTrade>
            <TotalAlerts>
              <p>Equipe</p>
              <span>{`${Object.values(tradeAgroupeds).length}`}</span>
            </TotalAlerts>

            <Separator />

            <ContentDetailsTrade>
              <div className="details">
                <div className="lineDetail">
                  <span>{`${notStarted}`}</span>
                  <p>Não iniciados</p>
                </div>
                <div className="lineDetail">
                  <span>{`${started}`}</span>
                  <p>Iniciados</p>
                </div>
                <div className="lineDetail">
                  <span>{`${finished}`}</span>
                  <p>Finalizados</p>
                </div>

                <div className="lineDetail">
                  <span>{`${progress}`}</span>
                  <p>Atendendo</p>
                </div>
                <div className="lineDetail">
                  <span>{`${paused}`}</span>
                  <p>Pausado</p>
                </div>
              </div>
            </ContentDetailsTrade>
          </ContentCardDetailsTrade>
        )}
      </Content>
    );
  }
}
