import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { getFromStorage } from '../../../../../services/auth';
import { ContentCardClients, TotalAlertsClients, Separator, ContentDetailsClients, Content } from './styled';

export default class ClientsIndicatorMobile extends Component {
  state = {
    loading: false,
    unAnswered: 0, //não atendido
    answering: 0, //atendendo
    attended: 0, //atendidos
    countClients: 0,
  };

  async componentDidMount() {
    this.mounted = true;
    await this.carregarVariaveisEstado();
    await this.handleData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      if (this.mounted) {
        this.setState({
          loading: this.props.data?.length === 0 && prevProps.data?.length === 0 ? false : true,
        });
        await this.handleData();
      }
    } else if (
      this.props.dataSchedules !== prevProps.dataSchedules
      // this.props.dataSchedules.length > 0
    ) {
      if (this.mounted) {
        this.setState({
          loading: this.props.dataSchedules.length === 0 ? prevProps.data === 0 && false : true,
        });
        await this.handleData();
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

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  handleData = async () => {
    if (this.mounted) {
      await this.getCLientsScheduled();
      await this.getSchedules().then(() =>
        setTimeout(() => {
          if (this.mounted)
            this.setState({
              loading: false,
            });
        }, 600)
      );
    }
  };

  getCLientsScheduled = async () => {
    if (this.mounted) {
      const { data, typeFilter } = this.props;

      let countClients = 0;
      data &&
        data.forEach((schedule) => {
          if (parseInt(typeFilter) === schedule.TIPO) {
            countClients += schedule.CLIENTES.length;
          }
        });

      // this.setState({ schedules });
      this.setState({
        countClients,
      });
    }
  };

  getSchedules = async () => {
    if (this.mounted) {
      const { dataSchedules } = this.props;
      let { countClients } = this.state;
      countClients = 0;

      let notStarted = 0;
      let progress = 0;
      let finished = 0;

      dataSchedules.forEach((schedule) => {
        progress += schedule.ATD_ANDAMENTO;
        finished += schedule.ATD_FINALIZADO + schedule.ATD_JUSTIFICADOS;
        countClients += schedule.ATD_TOTAL;
      });

      notStarted = countClients - finished;

      this.setState({
        unAnswered: notStarted,
        answering: progress,
        attended: finished,
        countClients,
      });
    }
  };

  render() {
    const { unAnswered, answering, attended, countClients, loading } = this.state;

    return (
      <Content>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={60} width={170} />
          </div>
        ) : (
          loading === false && (
            <ContentCardClients>
              <TotalAlertsClients>
                <p>Clientes</p>
                <span>{`${countClients}`}</span>
              </TotalAlertsClients>

              <Separator />

              <ContentDetailsClients>
                <div className="lineDetail">
                  <span>{`${unAnswered}`}</span>
                  <p>Não atendidos </p>
                </div>
                <div className="lineDetail">
                  <span>{`${answering}`}</span>
                  <p>Atendendo</p>
                </div>
                <div className="lineDetail">
                  <span>{`${attended}`}</span>
                  <p>Atendidos</p>
                </div>
              </ContentDetailsClients>
            </ContentCardClients>
          )
        )}
      </Content>
    );
  }
}
